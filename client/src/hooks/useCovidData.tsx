import useCSV from './useCSV'
import useFetch from './useFetch'
import { useState, useEffect } from 'react'
import { CountyData, Timeline, Snapshot } from '../interfaces'
import { DSVRowString } from 'd3'
import { DataEntry } from '../interfaces'
import PlaceFactory from '../helpers/PlaceFactory'

function formatTimeline(timeline: Timeline<CountyData>, isDataTotal: boolean, isDataRelative: boolean, isDataCases: boolean) {
    // This is a generic function for performing some function on every
    // value found in a Map in the timeline
    const updateTimeline = (
        timeline: Timeline<number>, 
        newValueFun: (timeline: Timeline<number>, index: number, fips: number) => number
    ) => {
        const snapshots: Snapshot[] = []
        let max = 0

        timeline.snapshots.forEach((snapshot, index) => {
            const newStatistics: any = {}

            Object.keys(snapshot.statistics).forEach(fipsString => {
                const fips = parseInt(fipsString)
                const newValue = newValueFun(timeline, index, fips)
                newStatistics[fips] = newValue

                if (newValue > max) {
                    max = newValue
                }
            })

            snapshots.push({ timestamp: snapshot.timestamp, statistics: newStatistics })
        })

        return { snapshots, max } as Timeline<number>
    }

    // Initialize mapping data
    const snapshots = timeline.snapshots.map(snapshot => {
        const newStatistics: any = {}

        Object.entries(snapshot.statistics).forEach(keyValue => {
            const fips = keyValue[0]
            const countyData = keyValue[1] as CountyData
            const value = isDataCases ? countyData.numInfected : countyData.numDead
            newStatistics[fips] = value
        })

        return { timestamp: snapshot.timestamp, statistics: newStatistics } as Snapshot
    })
    const max = timeline.max.numInfected
    let newMappingData: Timeline<number> = { snapshots, max }

    if (!isDataTotal) {
        const getDelta = (timeline: Timeline<number>, index: number, fips: number) => {
            const num = timeline.snapshots[index].statistics[fips.toString()]!

            if (index === 0) {
                return num
            } else {
                const lastNum = timeline.snapshots[index - 1].statistics[fips.toString()]

                if (lastNum !== undefined) {
                    return num - lastNum
                } else {
                    return num
                }
            }
        }

        newMappingData = updateTimeline(newMappingData, getDelta)
    }

    if (isDataRelative) {
        const getPercentage = (timeline: Timeline<number>, index: number, fips: number) => {
            const num = timeline.snapshots[index].statistics[fips.toString()]
            const population = PlaceFactory(fips).getPopulation()

            return num / population
        }

        newMappingData = updateTimeline(newMappingData, getPercentage)
    }

    return newMappingData
}

const useCovidData = (
    selectedFips: number, 
    isDataTotal: boolean, 
    isDataRelative: boolean, 
    isDataCases: boolean,
    isDataPredicted: boolean,
    typeOfPrediction: string
) => {
    const countiesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const nationData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
    const statesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv')

    const [timeline, setTimeline] = useState<Timeline<CountyData> | null>(null)
    const [mappingData, setMappingData] = useState<Timeline<number> | null>(null)
    const [graphingData, setGraphingData] = useState<DataEntry[][] | null>(null)
    const [predictedTimeline, setPredictedTimeline] = useState<Timeline<CountyData> | null>(null)
    const [percentile, setPercentile] = useState<number | null>(null)

    // Get data for maps
    useFetch('/timeline', (newTimeline) => {
        setTimeline(newTimeline)
    })

    useFetch(`/timeline/${typeOfPrediction}`, (newPredictedTimeline) => {
        console.log("TYPE", typeOfPrediction)
        setPredictedTimeline(newPredictedTimeline)
        console.log("PREDICTIONS", newPredictedTimeline)
    })

    // Format mapping data based on parameters
    useEffect(() => {
        if (!timeline || (!predictedTimeline && isDataPredicted)) {
            return
        }

        const historicalMapTimeline = formatTimeline(
            timeline, 
            isDataTotal, 
            isDataRelative, 
            isDataCases
        )

        // Sort the snapshots so that we can find a percentile that will
        // be used for displaying the values
        const sortedValues = historicalMapTimeline.snapshots.map(snapshot => {
            const values: number[] = []
            
            Object.values(snapshot.statistics).forEach((value: unknown) => {
            values.push(value as number)
            })

            return values
        })
            .flat()
            .sort((a, b) => a - b)

        const percentileIndex = Math.floor(sortedValues.length * 0.997)
        const _percentile = sortedValues[percentileIndex]

        setPercentile(_percentile)

        if (isDataPredicted) {
            let predictedMapTimeline = formatTimeline(
                predictedTimeline!,
                isDataTotal, 
                isDataRelative, 
                isDataCases
            )

            predictedMapTimeline.max = historicalMapTimeline.max
            setMappingData(predictedMapTimeline)
        } else {
            setMappingData(historicalMapTimeline)
        }

    }, [timeline, predictedTimeline, isDataTotal, isDataRelative, isDataCases, isDataPredicted])

    // Get data for graphs, this does not do any transformations on the
    // graphing data based on the parameters selected
    useEffect(() => {
        if (!countiesData || !nationData || !statesData) {
            return
        }

        const formatRow = (row: DSVRowString<string>, type: string) => {
            return {
                date: row['date']!,
                fips: type === "state" ? parseInt(row['fips']!) * 1000 : parseInt(row['fips']!),
                cases: parseInt(row['cases']!),
                deaths: parseInt(row['deaths']!),
            } as DataEntry
        }

        const _nationData = nationData.map(row => formatRow(row, "nation"))
        const stateData = statesData
            .filter(row => parseInt(row.fips!) === Math.floor(selectedFips / 1000))
            .map(row => formatRow(row, "state"))
        const countyData = countiesData
            .filter(row => parseInt(row.fips!) === selectedFips)
            .map(row => formatRow(row, "county"))

        setGraphingData([countyData, stateData, _nationData])
    }, [countiesData, nationData, statesData, selectedFips])

    const returnValue: [Timeline<number> | null, DataEntry[][] | null, number | null] = [mappingData, graphingData, percentile]
    return returnValue
}

export default useCovidData