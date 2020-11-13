const fs = require('fs')
const csv = require('csv-parser')

const cases_file = 'counties_cases.csv'
const deaths_file = 'counties_deaths.csv'

interface Data {
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

async function parse_file(file_name: string) {
    let data: Row[] = []

    const reader = fs.createReadStream(file_name)

    reader
        .pipe(csv())
        .on('data', (row: any) => {
            if (row.date) {
                const timestamp = (new Date(row.date)).getTime()
                const fips = parseInt(row.fips)
                const mask = parseInt(row["Mask"])
                const socialDistance = parseInt(row["social distance"])
                const contactTracing = parseInt(row["contact tracing"])
                const mandatoryMasking = parseInt(row["mandatory masking"])
                const strictSocialDistance = parseInt(row["Strict social distance"])

                data.push({
                    timestamp,
                    fips,
                    values: {
                        mask,
                        socialDistance, 
                        contactTracing,
                        mandatoryMasking,
                        strictSocialDistance
                    }
                })
            }
        })

    return new Promise<any>((resolve, reject) => {
        reader.on('end', (reason: any) => {
            resolve(data)
        })
        reader.on('error', reject)
    })
}

function trim(rows: Row[], cutoff: number) {
    const oneWeekAgo = new Date(cutoff)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekBeforeCuttoff = oneWeekAgo.getTime()
    return rows.filter(row => {
        return row.timestamp >= oneWeekBeforeCuttoff && row.timestamp <= cutoff 
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

                if (num_matches > 1) {
                    console.log("AHHHHHHH");
                }
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

function createTimelines(data: Map<number, Pair[]>) {
    const keys = [
        "mask",
        "socialDistance",
        "contactTracing",
        "mandatoryMasking",
        "strictSocialDistance"
    ]

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
                    numInfected: pair.cases ? pair.cases.values[key] : null,
                    numDead: pair.deaths? pair.deaths.values[key] : null
                }

                snapshot!.statistics[fips.toString()] = stat
            })
        })

        const sortedTimestamps = Array.from(snapshotMap.keys()).sort()
        sortedTimestamps.forEach(timestamp => {
            timeline.snapshots.push(snapshotMap.get(timestamp)!)
        })

        const json = JSON.stringify(timeline)
        fs.writeFileSync(`timeline_${key}.json`, json)
    })
}

export default async function getPredictions() {
    const cases: Row[] = await parse_file(cases_file)
    const deaths: Row[] = await parse_file(deaths_file)

    const cutoff = deaths[deaths.length - 1].timestamp

    const trimmed_cases = trim(cases, cutoff)
    const trimmed_deaths = trim(deaths, cutoff)

    const merged = merge(trimmed_cases, trimmed_deaths)

    createTimelines(merged)
}