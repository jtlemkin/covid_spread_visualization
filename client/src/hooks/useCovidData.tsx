import useFetch from './useFetch'
import { useState, useMemo, useEffect } from 'react'
import { CountyData, Timeline, DataEntry, ViewingParams } from '../interfaces'
import PlaceFactory from '../helpers/PlaceFactory'
import formatTimeline from '../helpers/formatTimeline'

// Iterates over timeline, summing up cases or deaths in the selected map
// viewing region
async function graphify(data: Timeline<number>, selectedFips: number) {
    return data.snapshots.map(snapshot => {
        let sum = Object.keys(snapshot.statistics)
            .filter(key => PlaceFactory(selectedFips).contains(parseInt(key)))
            .reduce((sum, key) => {
                if (snapshot.statistics[key] === null || Number.isNaN(snapshot.statistics[key])) {
                    return sum
                }

                const pop = PlaceFactory(parseInt(key)).getPopulation()        
                let n = snapshot.statistics[key] * pop
                return sum + n
            }, 0)

        // Sum is a percentage, but we want to display total numbers
        // so we multiply sum by the population of the place we're graphing
        return {
            date: snapshot.timestamp,
            fips: selectedFips,
            value: sum
        } as DataEntry
    })
}

const useCovidData = (selectedFips: number, vp: ViewingParams) => {
    const [historical, isFetchingHistorical] = useFetch<Timeline<CountyData>>('/timeline/cases', false)
    const [predicted, isFetchingPredicted] = useFetch<Timeline<CountyData>>(`/timeline/${vp.predictionType}`, false)
    const [historicalGraphingData, setHistoricalGraphingData] = useState<DataEntry[] | null>(null)
    const [predictedGraphingData, setPredictedGraphingData] = useState<DataEntry[] | null>(null)

    const historicalMappingData = useMemo(() => {
        if (isFetchingHistorical) {
            return null
        }

        return formatTimeline(
            historical!, 
            vp.isTotal, 
            vp.isCases
        )
    }, [historical, isFetchingHistorical, vp.isTotal, vp.isCases])

    const predictedMappingData = useMemo(() => {
        if (isFetchingPredicted) {
            return null
        }

        return formatTimeline(
            predicted!, 
            vp.isTotal, 
            vp.isCases
        )
    }, [predicted, isFetchingPredicted, vp.isTotal, vp.isCases])

    let percentile = historicalMappingData ? historicalMappingData.max * 0.4 : null
    if (!vp.isTotal && percentile) {
        percentile /= 8
    }
    if (!vp.isCases && percentile) {
        percentile /= 2
    }
    if (!vp.isCases && !vp.isTotal && percentile) {
        percentile /= 4
    }

    useEffect(() => {
        if (!historicalMappingData) {
            setHistoricalGraphingData(null)
            return
        } else {
            graphify(historicalMappingData, selectedFips)
                .then(setHistoricalGraphingData)
        }
    }, [historicalMappingData, selectedFips])

    useEffect(() => {
        if (!predictedMappingData) {
            setPredictedGraphingData(null)
        } else {
            graphify(predictedMappingData, selectedFips)
                .then(setPredictedGraphingData)
        }
    }, [predictedMappingData, selectedFips])

    const graphingData = historicalGraphingData && predictedGraphingData ? (
        [historicalGraphingData, predictedGraphingData] as [DataEntry[], DataEntry[]]
    ) : (
        null
    )

    const isFetchingCovidData = !historicalMappingData || !predictedMappingData

    return {
        mappingData: predictedMappingData,
        graphingData,
        percentile,
        isFetchingCovidData
    }
}

export default useCovidData