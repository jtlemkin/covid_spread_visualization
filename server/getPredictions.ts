const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')
const axios = require('axios')

const cases_file = 'counties_cases.csv'
const deaths_file = 'counties_deaths.csv'

async function downloadCSV(url, fname) {
    const _path = path.resolve(__dirname, fname)
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

interface Data {
    cases: number,
    mask: number,
    socialDistance: number,
    contactTracing: number,
    mandatoryMasking: number,
    strictSocialDistance: number
}

interface Row {
    timestamp: number,
    fips: number,
    values: Data
}

async function parse_file(file_name: string, type: "cases" | "deaths") {
    let data: Row[] = []

    const reader = fs.createReadStream(file_name)

    reader
        .pipe(csv())
        .on('data', (row: any) => {
            if (row.date) {
                const timestamp = (new Date(row.date)).getTime()
                const fips = parseInt(row.fips)
                const cases = parseInt(row[type])
                const mask = parseInt(row["Masking"])
                const socialDistance = parseInt(row["Social Distancing"])
                const contactTracing = parseInt(row["Contact Tracing"])
                const mandatoryMasking = parseInt(row["Mandatory Masking"])
                const strictSocialDistance = parseInt(row["Strict social distancing"])

                // This way we don't include US territories which we don't currently 
                // have population data for
                if (!row.fips.startsWith("72") && !row.fips.startsWith("78")) {
                    const entry = {
                        timestamp,
                        fips,
                        values: {
                            cases,
                            mask,
                            socialDistance, 
                            contactTracing,
                            mandatoryMasking,
                            strictSocialDistance
                        }
                    }

                    data.push(entry)
                }
            }
        })

    return new Promise<any>((resolve, reject) => {
        reader.on('end', (reason: any) => {
            resolve(data)
        })
        reader.on('error', reject)
    })
}

interface Pair {
    cases: Row | null,
    deaths: Row | null
}

function merge(cases: Row[], deaths: Row[]) {
    const groups: Map<number, Pair[]> = new Map()

    // Add initial cases
    cases.forEach(row => {
        if (!groups.has(row.fips)) {
            groups.set(row.fips, [])
        }

        const rows = groups.get(row.fips)
        rows!.push({
            cases: row,
            deaths: null
        })
        groups.set(row.fips, rows!)
    })

    // Then add deaths to cases and sort
    deaths.forEach(row => {
        if (!groups.has(row.fips)) {
            groups.set(row.fips, [])
        }

        const rows = groups.get(row.fips)
        let num_matches = 0
        for (let i = 0; i < rows!.length; i += 1) {
            if (!rows![i].cases) {
                continue
            }

            if (rows![i].cases!.timestamp === row.timestamp) {
                rows![i].deaths = row
                num_matches += 1
            }
        }

        if (num_matches == 0) {
            rows!.push({
                cases: null,
                deaths: row
            })
        }
    })

    groups.forEach((pairs, key) => {
        const sorted = pairs.sort((a: Pair, b: Pair) => {
            const time1 = a.cases ? a.cases.timestamp : a.deaths!.timestamp
            const time2 = b.cases ? b.cases.timestamp : b.deaths!.timestamp

            return time1 - time2
        })

        groups.set(key, sorted)
    })

    return groups
}

interface Timeline {
    snapshots: Snapshot[],
    max: CountyData
}

interface Snapshot {
    timestamp: number,
    statistics: any
}

interface CountyData {
    numInfected: number,
    numDead: number,
}

const keys = [
    "cases",
    "mask",
    "socialDistance",
    "contactTracing",
    "mandatoryMasking",
    "strictSocialDistance"
]

function aggregate(rows: Row[]) {
    let aggregated: Row[] = []

    for (let i = 0; i < rows.length; i++) {
        let newRow = rows[i]

        if (aggregated.length > 0 && (aggregated[i - 1].fips === newRow.fips)) {
            keys.forEach(key => {
                let prior: number | null | undefined = aggregated[i - 1].values[key]
    
                if (prior !== null && prior !== undefined) {
                    newRow.values[key] = Math.max(prior, prior + newRow.values[key])
                }
            })
        }

        aggregated.push(newRow)
    }

    return aggregated
}

function createTimelines(data: Map<number, Pair[]>) {
    keys.forEach(key => {
        let timeline: Timeline = {
            snapshots: [],
            max: {
                numInfected: 0,
                numDead: 0
            }
        }

        const snapshotMap: Map<number, Snapshot> = new Map()

        data.forEach(pairs => {
            pairs.forEach(pair => {
                const timestamp = pair.cases ? pair.cases.timestamp : pair.deaths!.timestamp
                const fips = pair.cases ? pair.cases.fips : pair.deaths!.fips

                if (!snapshotMap.has(timestamp)) {
                    snapshotMap.set(timestamp, {
                        timestamp,
                        statistics: {}
                    })
                }

                let snapshot = snapshotMap.get(timestamp)
                const stat = {
                    numInfected: pair.cases ? (pair.cases.values as any)[key] : null,
                    numDead: pair.deaths? (pair.deaths.values as any)[key] : null
                }

                snapshot!.statistics[fips.toString()] = stat
            })
        })

        const sortedTimestamps = Array.from(snapshotMap.keys()).sort()
        sortedTimestamps.forEach(timestamp => {
            timeline.snapshots.push(snapshotMap.get(timestamp)!)
        })

        // Remove snapshots so that we have two adjacent days representing
        // each week. We leave two so that the client can still extract
        // daily numbers on their machine
        let trimmedSnapshots: Snapshot[] = []
        let i = 0;
        for (; i < timeline.snapshots.length; i++) {
            const index = timeline.snapshots.length - 1 - i
            const snapshot = timeline.snapshots[index]

            if (i % 7 === 0 || i % 7 === 1) {
                trimmedSnapshots.push(snapshot)
            }
        }
        if (i % 7 === 1) {
            trimmedSnapshots.pop()
        }
        timeline.snapshots = trimmedSnapshots.reverse()

        const json = JSON.stringify(timeline)
        fs.writeFileSync(`timeline_${key}.json`, json)
    })
}

export default async function getPredictions() {
    const cases_url = 'https://raw.githubusercontent.com/jtlemkin/covid-data/main/strategies_cases.csv'
    const deaths_url = 'https://raw.githubusercontent.com/jtlemkin/covid-data/main/strategies_deaths.csv'
    await downloadCSV(cases_url, cases_file)
    await downloadCSV(deaths_url, deaths_file)

    const cases: Row[] = await parse_file(cases_file, "cases")
    const deaths: Row[] = await parse_file(deaths_file, "deaths")

    const agg_cases = aggregate(cases)
    const agg_deaths = aggregate(deaths)

    const merged = merge(agg_cases, agg_deaths)

    createTimelines(merged)
}