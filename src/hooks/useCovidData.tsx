import useCSV from './useCSV'
import moment from 'moment'
import populationsUntyped from '../data/populations.json'
import { useEffect, useState } from 'react'
import { Fips, Timeline, CovidStatistics } from '../interfaces'
import { DSVRowArray, DSVRowString } from 'd3'

function fipsesForRow(row: DSVRowString<string>) {
    if (row.county === "New York City") {
        console.log("Hello!")
        return [36061, 36047, 36081, 36005, 36085]
    } else {
        return [parseInt(row.fips!)]
    }
}

function createTimeline(covidData: DSVRowArray) {
    const populations = (populationsUntyped as any)
    // Initialize empty timeline
    let timeline: Timeline = {
        snapshots: [],
        highs: {
            percentInfected: 0,
            percentDead: 0,
            percentNewlyInfected: 0,
            percentNewlyDead: 0
        },
    }

    const parseRow = (row: DSVRowString<string>) => {
        const { snapshots, highs } = timeline
        const timestamp = moment(row.date).valueOf()
        let lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null

        // Add a new snapshot to the timeline if data is for a new day
        if (!lastSnapshot || timestamp > lastSnapshot.timestamp) {
            snapshots.push({
                timestamp: moment(row.date).valueOf(),
                countyStatistics: new Map<Fips, CovidStatistics>(),
            })

            lastSnapshot = snapshots[snapshots.length - 1]
        }

        // If the row has a county of New 
        const fipses = fipsesForRow(row)

        if (fipses.length > 1) {
            console.log("FIPS", row.county, fipses)
        }

        fipses.forEach(fips => {
            if (!lastSnapshot!.countyStatistics.has(fips)) {
                // Compute new values for county
                // In the case of New York, we have data for all the counties aggregated, so we want to 
                // divide that by the population in all new york city counties to get the percent
                const placePopulation = fipses.reduce((sum, fips) => sum + populations[convertFipsToKey(fips)], 0)
                const percentInfected = parseInt(row.cases!) / placePopulation
                const percentDead = parseInt(row.deaths!) / placePopulation
                const previousSnapshotCountyStatistics = snapshots.length > 1 ? (
                    snapshots[snapshots.length - 2].countyStatistics.get(fips)
                ) : ( 
                    null 
                )
                const percentNewlyInfected = previousSnapshotCountyStatistics ? (
                    percentInfected - previousSnapshotCountyStatistics.percentInfected
                ) : ( 
                    percentInfected 
                )
                const percentNewlyDead = previousSnapshotCountyStatistics ? (
                    percentDead - previousSnapshotCountyStatistics.percentDead
                ) : ( 
                    percentDead
                )
    
                // Update max stats for the snapshot
                if (percentInfected > highs.percentInfected) {
                    highs.percentInfected = percentInfected
                }
                if (percentDead > highs.percentDead) {
                    highs.percentDead = percentDead
                }
                if (percentNewlyInfected > highs.percentNewlyInfected) {
                    highs.percentNewlyInfected = percentNewlyInfected
                }
                if (percentNewlyDead > highs.percentNewlyDead) {
                    highs.percentNewlyDead = percentNewlyDead
                }
    
                // Set county data in snapshot
                lastSnapshot!.countyStatistics.set(
                    fips, 
                    { percentInfected, percentDead, percentNewlyInfected, percentNewlyDead}
                )
            }
        })
    }

    covidData.forEach(parseRow)

    return timeline
}

function convertFipsToKey(fips: number) {
    if (fips === 36061) {
        return "NYC"
    } else if (fips.toString().length < 5) {
        return `0${fips}`
    } else {
        return fips.toString()
    }
}

const useCovidData = () => {
    const covidData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const [isLoading, setIsLoading] = useState(true)
    const [covidTimeline, setCovidTimeline] = useState<Timeline | null>(null)

    useEffect(() => {
        if (covidData) {
            const timeline = createTimeline(covidData)
            setCovidTimeline(timeline)
            setIsLoading(false)
        }
    }, [covidData])

    const result: [Timeline | null, boolean] = [covidTimeline, isLoading]
    return result
}

export default useCovidData