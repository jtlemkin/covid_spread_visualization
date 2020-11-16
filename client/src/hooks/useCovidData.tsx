import useFetch from './useFetch'
import { useState, useMemo } from 'react'
import { CountyData, Timeline, DataEntry, ViewingParams } from '../interfaces'
import PlaceFactory from '../helpers/PlaceFactory'
import formatTimeline from '../helpers/formatTimeline'

// Iterates over timeline, summing up cases or deaths in the selected map
// viewing region
function graphify(data: Timeline<number>, selectedFips: number, isDataRelative: boolean) {
    return data.snapshots.map(snapshot => {
        let sum = Object.keys(snapshot.statistics)
            .filter(key => PlaceFactory(selectedFips).contains(parseInt(key)))
            .reduce((sum, key) => {
                if (snapshot.statistics[key] === null) {
                    return sum
                }
                
                let n = snapshot.statistics[key]
                if (isDataRelative) {
                    // The preprocessing done by the formatTimeline function turns
                    // snapshot.statistics[key] into a percentage, however in order
                    // to aggregate the percentage into a new percentage, we must
                    // convert snapshot.statistics[key] back to the whole number
                    // and then divide by the population of the encompassing place
                    // afterwards
                    n *= PlaceFactory(parseInt(key)).getPopulation()
                }
                return sum + n
            }, 0)

        if (isDataRelative) {
            sum /= PlaceFactory(selectedFips).getPopulation()
        }

        return {
            date: snapshot.timestamp,
            fips: selectedFips,
            value: sum
        } as DataEntry
    })
}

const useCovidData = (selectedFips: number, vp: ViewingParams) => {
    const [historical, setHistorical] = useState<Timeline<CountyData> | null>(null)
    const [predicted, setPredicted] = useState<Timeline<CountyData> | null>(null)

    useFetch('/timeline/cases', (newTimeline) => {
        setHistorical(newTimeline)
    })

    useFetch(`/timeline/${vp.predictionType}`, (newTimeline) => {
        setPredicted(newTimeline)
    })

    const historicalMappingData = useMemo(() => {
        if (!historical) {
            return null
        }

        return formatTimeline(
            historical, 
            vp.isTotal, 
            vp.isRelative, 
            vp.isCases
        )
    }, [historical, vp.isTotal, vp.isRelative, vp.isCases])

    const predictedMappingData = useMemo(() => {
        if (!predicted) {
            return null
        }

        return formatTimeline(
            predicted, 
            vp.isTotal, 
            vp.isRelative, 
            vp.isCases
        )
    }, [predicted, vp.isTotal, vp.isRelative, vp.isCases])

    const percentile = historicalMappingData ? historicalMappingData.max * 0.3 : null

    const historicalGraphingData = useMemo(() => {
        if (!historicalMappingData) {
            return []
        }

        return graphify(historicalMappingData, selectedFips, vp.isRelative)
    }, [historicalMappingData, selectedFips, vp.isRelative])

    const predictedGraphingData = useMemo(() => {
        if (!predictedMappingData) {
            return []
        }

        return graphify(predictedMappingData, selectedFips, vp.isRelative)
    }, [predictedMappingData, selectedFips, vp.isRelative])

    return {
        mappingData: predictedMappingData,
        graphingData: [historicalGraphingData, predictedGraphingData],
        percentile
    }
}

export default useCovidData