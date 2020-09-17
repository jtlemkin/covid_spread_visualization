import useCSV from './useCSV'
import moment from 'moment'
import populationsUntyped from '../data/populations.json'
import { useEffect, useState } from 'react'
import { Fips, Timeline, CovidStatistics } from '../interfaces'
import { DSVRowArray, DSVRowString } from 'd3'

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

        const fips = parseInt(row.fips!)
        if (!lastSnapshot.countyStatistics.has(fips)) {
            // Compute new values for county
            const countyPopulation = populations[convertFipsToKey(fips)]
            const percentInfected = parseInt(row.cases!) / countyPopulation
            const percentDead = parseInt(row.deaths!) / countyPopulation
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
            lastSnapshot.countyStatistics.set(
                fips, 
                { percentInfected, percentDead, percentNewlyInfected, percentNewlyDead}
            )
        }
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