const fs = require('fs')
const csv = require('csv-parser')

const cases_file = 'counties_cases.csv'
const deaths_file = 'counties_deaths.csv'

const keys = [
    "Mask", 
    "social distance", 
    "contact tracing", 
    "mandatory masking", 
    "Strict social distance"
]

function formatKey(key: any) {
    return key.toLowerCase().replace(' ', '_').replace(' ', '_')
}

async function parse_file(file_name: string) {
    let data: any = {}

    const reader = fs.createReadStream(file_name)

    reader
        .pipe(csv())
        .on('data', (row: any) => {
            keys.forEach(key => {
                const formatted = formatKey(key)

                if (!(formatted in data)) {
                    data[formatted] = {}
                }
                
                if (!(row.county in data[formatted])) {
                    data[formatted][row.county] = []
                }

                const timestamp = Date.parse(row.date)

                data[formatted][row.county].push({
                    fips: row.fips,
                    timestamp,
                    "value": row[key],
                })

                const start = data[formatted][row.county].length - 7
                const end = data[formatted][row.county].length
                const slice = data[formatted][row.county].slice(start, end)

                data[formatted][row.county] = slice
            })
        })

    return new Promise<any>((resolve, reject) => {
        reader.on('end', (reason: any) => {
            resolve(data)
        })
        reader.on('error', reject)
    })
}

function createJSON(key: string, cases: any, deaths: any) {
    let results: any = {}

    // Combine infections and deaths
    Object.keys(cases[key]).forEach(county => {
        cases[key][county].forEach((stat: any, i: number) => {
            const statistics = {
                numInfected: stat.value,
                numDead: deaths[key][county][i].value
            }

            if (!(county in results)) {
                results[county] = []
            }
    
            const result = { 
                fips: stat.fips,
                timestamp: stat.timestamp,
                statistics
            }
            
            results[county].push(result)
        })
    })

    // Group by timestamp
    let timestamped: any = {}
    for (const fips in results) {
        for (const data of results[fips]) {
            if (!(data.timestamp in timestamped)) {
                timestamped[data.timestamp] = {}
            }

            timestamped[data.timestamp][parseInt(data.fips).toString()] = data.statistics
        }
    }

    // Convert to array
    let timestamped_array = Object.keys(timestamped).map(timestamp => {
        return {
            timestamp: parseInt(timestamp),
            statistics: timestamped[timestamp]
        }
    })

    timestamped_array.sort((a, b) => a.timestamp - b.timestamp)

    const json = JSON.stringify(timestamped_array)
    fs.writeFileSync(`timeline_${key}.json`, json)
    console.log("write!")
}

export default async function getPredictions() {
    const cases = await parse_file(cases_file)
    const deaths = await parse_file(deaths_file)

    for (const key of keys) {
        const formatted = formatKey(key)
        console.log(formatted)
        createJSON(formatted, cases, deaths)
    }
}