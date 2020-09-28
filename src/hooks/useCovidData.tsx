import useCSV from './useCSV'
import { useEffect, useState } from 'react'
import { CountyData, Timeline, Snapshot } from '../interfaces'
import { createTimeline } from '../helpers/createTimeline'
import { DSVRowString } from 'd3'
import { DataEntry } from '../interfaces'
import PlaceFactory from '../PlaceFactory'

const useCovidData = (fips: number, isDataDaily: boolean, isDataRelative: boolean) => {
    const countiesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const nationData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
    const statesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv')

    const [absoluteMappingData, setAbsoluteMappingData] = useState<Timeline<CountyData> | null>(null)
    const [mappingData, setMappingData] = useState<Timeline<number> | null>(null)
    const [graphingData, setGraphingData] = useState<DataEntry[][] | null>(null)

    // Get data for maps
    useEffect(() => {
        if (countiesData && nationData && statesData) {
            const timeline = createTimeline(countiesData)
            setAbsoluteMappingData(timeline)
        }

    }, [countiesData, nationData, statesData])

    // Format mapping data based on parameters
    useEffect(() => {
        if (!absoluteMappingData) {
            return
        }

        const updateTimeline = (
            timeline: Timeline<number>, 
            newValueFun: (timeline: Timeline<number>, index: number, fips: number) => number
        ) => {
            const snapshots: Snapshot<number>[] = []
            let max = 0

            timeline.snapshots.forEach((snapshot, index) => {
                const newStatistics = new Map<number, number>()

                snapshot.statistics.forEach((num, fips) => {
                    const newValue = newValueFun(timeline, index, fips)
                    newStatistics.set(fips, newValue)

                    if (newValue > max) {
                        max = newValue
                    }
                })

                snapshots.push({ timestamp: snapshot.timestamp, statistics: newStatistics })
            })

            return { snapshots, max } as Timeline<number>
        }

        // Initialize mapping data
        const snapshots = absoluteMappingData.snapshots.map(snapshot => {
            const newStatistics = new Map<number, number>()

            snapshot.statistics.forEach((countyData, fips) => {
                newStatistics.set(fips, countyData.numInfected)
            })

            return { timestamp: snapshot.timestamp, statistics: newStatistics } as Snapshot<number>
        })
        const max = absoluteMappingData.max.numInfected
        let newMappingData: Timeline<number> = { snapshots, max }

        if (isDataDaily) {
            const getDelta = (timeline: Timeline<number>, index: number, fips: number) => {
                const num = timeline.snapshots[index].statistics.get(fips)!
    
                if (index === 0) {
                    return num
                } else {
                    const lastNum = timeline.snapshots[index - 1].statistics.get(fips)
    
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
                const num = timeline.snapshots[index].statistics.get(fips)!
                const population = PlaceFactory(fips).getPopulation()
    
                return num / population
            }

            newMappingData = updateTimeline(newMappingData, getPercentage)
        }

        setMappingData(newMappingData)

    }, [absoluteMappingData, isDataDaily, isDataRelative])

    // Get data for graphs
    useEffect(() => {
        if (!countiesData || !nationData || !statesData) {
            return
        }

        const typeRow = (row: DSVRowString<string>) => {
            return {
                date: row['date']!,
                fips: parseInt(row['fips']!),
                cases: parseInt(row['cases']!),
                deaths: parseInt(row['deaths']!),
            } as DataEntry
        }

        const _nationData = nationData.map(typeRow)
        const stateData = statesData
            .filter(row => parseInt(row.fips!) === Math.floor(fips / 1000))
            .map(row => {
                return {
                    date: row['date']!,
                    fips: parseInt(row['fips']!) * 1000,
                    cases: parseInt(row['cases']!),
                    deaths: parseInt(row['deaths']!),
                } as DataEntry
            })
        const countyData = countiesData
            .filter(row => parseInt(row.fips!) === fips)
            .map(typeRow)

        setGraphingData([countyData, stateData, _nationData])
    }, [countiesData, nationData, statesData, fips])

    const returnValue: [Timeline<number> | null, DataEntry[][] | null] = [mappingData, graphingData]
    return returnValue
}

export default useCovidData