const fs = require('fs')
const path = require('path')
const axios = require('axios')
const csv = require('csv-parser')

const filename = 'us-counties.csv'

async function downloadNYTCSV () {
    const url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'
    const _path = path.resolve(__dirname, filename)
    const writer = fs.createWriteStream(_path)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

async function getNYTRowArray() {
    await downloadNYTCSV()

    let data: NYTCSVRow[] = new Array<NYTCSVRow>()

    const reader = fs.createReadStream(filename)

    reader
        .pipe(csv())
        .on('data', (row: any) => {
            const typed = {
                date: row.date,
                county: row.county,
                state: row.state,
                fips: parseInt(row.fips),
                cases: parseInt(row.cases),
                deaths: parseInt(row.deaths)
            }

            data.push(typed)
        })
        .on('end', () => {
            console.log('CSV file successfully processed')
        })

    return new Promise<NYTCSVRow[]>((resolve, reject) => {
        reader.on('end', (reason: any) => {
            resolve(data)
        })
        reader.on('error', reject)
    })
}

function fipsesForRow(row: NYTCSVRow) {
    if (row.county === "New York City") {
        return [36061, 36047, 36081, 36005, 36085]
    } else {
        return [row.fips]
    }
}

function isValidRow(row: NYTCSVRow) {
    const blacklistedStates = ["Virgin Islands", "Puerto Rico", "Northern Mariana Islands"];

    return (
        row.county! !== "Unknown" && 
        !blacklistedStates.includes(row.state!) &&
        row.county !== "Kansas City" && // The data for Kansas City is spread among different counties
        row.county !== "Joplin" // The same goes for Joplin
    )
}

export function createTimeline(covidData: NYTCSVRow[]) {
    const snapshotRowGroups = covidData.reduce((snapshotRowGroups: NYTCSVRow[][], row) => {
        if (!isValidRow(row)) {
            return snapshotRowGroups //continue
        }

        const lastGroup = snapshotRowGroups.length > 0 ? snapshotRowGroups[snapshotRowGroups.length - 1] : null
        const currentDate = new Date(row.date)
        // If we don't have any groups, or the row doesn't belong to the most recent group
        if (!lastGroup || currentDate > new Date(lastGroup[0].date)) {
            snapshotRowGroups.push([row])
        } else {
            lastGroup.push(row)
        }

        return snapshotRowGroups
    }, new Array<Array<NYTCSVRow>>())

    const snapshots: Snapshot[] = snapshotRowGroups.reduce((snapshots, snapshotRows) => {
        const timestamp = new Date(snapshotRows[0].date).getTime()
        const countyStatistics = snapshotRows.reduce((statistics, row) => {
            const fipses = fipsesForRow(row)

            fipses.forEach(fips => {
                const numInfected = row.cases
                const numDead = row.deaths

                statistics[fips.toString()] = { numInfected, numDead }
            })

            return statistics
        }, {} as any)

        snapshots.push({ timestamp, statistics: countyStatistics })

        return snapshots
    }, new Array<Snapshot>())

    const max = snapshots.reduce((highs, snapshot) => {
        Object.values(snapshot.statistics).forEach((statistics: any) => {
            const { numInfected, numDead } = statistics
            
            if (numInfected > highs.numInfected) {
                highs.numInfected = numInfected;
            }
            if (numDead > highs.numDead) {
                highs.numDead = numDead;
            }
        })

        return highs
    }, {
        numInfected: 0,
        numDead: 0,
    })

    return { snapshots, max } as Timeline;
}

export default async function updateTimeline() {
    getNYTRowArray().then(data => {
        const timeline = createTimeline(data)
        console.log("ex", timeline.snapshots[0].statistics)

        const json = JSON.stringify(timeline)

        fs.writeFileSync('timeline.json', json)
        console.log("write!")
    })
}

export interface NYTCSVRow {
    date: string,
    county: string,
    state: string,
    fips: number,
    cases: number,
    deaths: number
}

export interface Snapshot {
    timestamp: number,
    statistics: any
}

export type Fips = number

export interface CountyData {
    numInfected: number,
    numDead: number,
}

export interface Timeline {
    snapshots: Snapshot[],
    max: CountyData,
}