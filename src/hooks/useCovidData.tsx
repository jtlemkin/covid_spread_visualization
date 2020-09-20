import useCSV from './useCSV'
import { useEffect, useState } from 'react'
import { Timeline } from '../interfaces'
import { createTimeline } from './util/createTimeline'
import { DSVRowArray, DSVRowString } from 'd3'

const useCovidData = (fips: number) => {
    const countiesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv')
    const nationData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
    const statesData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv')

    const [mappingData, setMappingData] = useState<Timeline | null>(null)
    const [graphingData, setGraphingData] = useState<DSVRowArray<string> | DSVRowString[] | null>(null)

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

        const selectedPlaceType = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county")

        if (selectedPlaceType === "nation") {
            setGraphingData(nationData)
        } else if (selectedPlaceType === "state") {
            const stateData = statesData.filter(row => parseInt(row.fips!) === fips / 1000)
            setGraphingData(stateData)
        } else {
            const countyData = countiesData.filter(row => parseInt(row.fips!) === fips)
            setGraphingData(countyData)
        }
    }, [countiesData, nationData, statesData, fips])

    const returnValue: [Timeline | null, DSVRowArray<string> | DSVRowString[] | null] = [mappingData, graphingData]
    return returnValue
}

export default useCovidData