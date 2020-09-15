import useCSV from './useCSV'
import moment from 'moment'
import populations from '../data/populations.json'
import { useEffect, useState } from 'react'
import * as d3 from 'd3'

function convertFipsToKey(fips: number) {
    if (fips === 36061) {
        return "NYC"
    } else if (fips.toString().length < 5) {
        return `0${fips}`
    } else {
        return fips.toString()
    }
}

function parseData(data: d3.DSVRowArray<string>) {
    return data.reduce((memo, row) => {
        const fips = row.fips ? parseInt(row.fips) : 36061
        const timestamp = moment(row.time!).valueOf()
        const cases = parseInt(row.cases!)
        const deaths = parseInt(row.deaths!)
        const population = (populations as any)[convertFipsToKey(fips)]

        // Memo is just the intermediate value of the array of county data that we're trying
        // to build
        if (!memo.has(fips)) {
            memo.set(fips, [])
        }

        const countyData = memo.get(fips)!

        if (countyData.length === 0 || timestamp > countyData[countyData.length - 1].timestamp) {
            countyData.push({
                timestamp,
                percentInfected: cases / population,
                percentDead: deaths / population
            })
        }

        return memo
    }, new Map<number, Array<CountyCovidStatistics>>())
}

function getNewest(data: Map<number, Array<CountyCovidStatistics>>) {
    let newest = new Map<number, CountyCovidStatistics>()
    data.forEach((countyData, fips) => {
        newest.set(fips, countyData[countyData.length - 1])
    })
    return newest
}

function getNormalizedRates(data: Map<number, Array<CountyCovidStatistics>>, maxCasePercentage: number) {
    let normalizedRates = new Map<number, Array<number>>()
    data.forEach((countyData, fips) => {
        normalizedRates.set(fips, countyData.map(statistics => {
            return statistics.percentInfected / maxCasePercentage
        }))
    })
    return normalizedRates
}

const useCovidData = () => {
    const covidData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const [countyRates, setCountyRates] = useState<Map<number, number[]> | null>(null)

    useEffect(() => {
        if (!covidData) {
            return
        }

        const memo = parseData(covidData)
        // This is the same as memo except is only has the most recent statstics instead of an array
        const newest = getNewest(memo)
        let maxCasePercentage = 0
        newest.forEach(statistics => {
            if (statistics.percentInfected > maxCasePercentage) {
                maxCasePercentage = statistics.percentInfected
            }
        })
        const normalizedRates = getNormalizedRates(memo, maxCasePercentage)

        setCountyRates(normalizedRates)
    }, [covidData])

    return countyRates
}

export type Fips = number

export interface Snapshot {
    timestamp: number,
    data: Map <Fips, CountyCovidStatistics>
}

export interface CountyCovidStatistics {
    timestamp: number,
    percentInfected: number,
    percentDead: number,
}

export default useCovidData