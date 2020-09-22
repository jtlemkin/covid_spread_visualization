import useCSV from './useCSV'
import { useEffect, useState } from 'react'
import { Timeline } from '../interfaces'
import { createTimeline } from './util/createTimeline'
import { DSVRowArray, DSVRowString } from 'd3'
import { DataEntry } from '../interfaces'

const useCovidData = (fips: number) => {
    const countiesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const nationData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
    const statesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv')

    const [mappingData, setMappingData] = useState<Timeline | null>(null)
    const [graphingData, setGraphingData] = useState<DataEntry[][] | null>(null)

    useEffect(() => {
        if (countiesData && nationData && statesData) {
            const timeline = createTimeline(countiesData)
            setMappingData(timeline)
        }
    }, [countiesData, nationData, statesData])

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

    const returnValue: [Timeline | null, DataEntry[][] | null] = [mappingData, graphingData]
    return returnValue
}

export default useCovidData