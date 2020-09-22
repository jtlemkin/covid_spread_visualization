import React, { useState } from 'react'
import styled from 'styled-components'
import { Graph } from './Graph'
import Switch from "react-switch"
import { DataEntry } from './interfaces'
import PlaceFactory from './PlaceFactory'
import colors from './colors'

const Column = styled.div`
    padding: 25px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`

interface LabelledSwitchProps {
    label: string,
    onChange: (value: boolean) => void,
    checked: boolean
}

export const LabelledSwitch = ({ label, onChange, checked }: LabelledSwitchProps) => {
    return (
        <Row style={{padding: '10px'}}>
            <p style={{paddingRight: '5px'}}>{label}</p>
            <Switch onChange={onChange} checked={checked} />
        </Row>
    )
}

interface GraphDashboardProps {
    data: DataEntry[][],
    fips: number
}

export const GraphDashboard = ({ data, fips }: GraphDashboardProps) => {
    const [countyData, stateData, nationData] = data
    const selectedPlaceType = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county")

    const [isDailyData, setIsDailyData] = useState(false)
    const [isRelativeData, setIsRelativeData] = useState(false)
    
    const choices = {
        county: countyData,
        state: stateData,
        nation: nationData
    }

    let graphingData = [choices[selectedPlaceType]]

    if (isRelativeData) {
        if (selectedPlaceType === "county") {
            graphingData.push(choices["state"])
            graphingData.push(choices["nation"])
        } else if (selectedPlaceType === "state") {
            graphingData.push(choices["nation"])
        }

        const selectedPlace = PlaceFactory(fips)

        const populations = [
            selectedPlace.getPopulation(), 
            selectedPlace.getOwner()?.getPopulation(),
            selectedPlace.getOwner()?.getOwner()?.getPopulation()
        ]

        graphingData = graphingData.map((lineData, index) => {
            return lineData.map(dataEntry => {
                return {
                    ...dataEntry,
                    cases: dataEntry.cases / populations[index]!,
                    deaths: dataEntry.deaths / populations[index]!
                } as DataEntry
            })
        })
    }

    if (isDailyData) {
        graphingData = graphingData.map(lineData => {
            return lineData.map((dataEntry, index) => {
                if (index === 0) {
                    return dataEntry
                } else {
                    return {
                        ...dataEntry,
                        cases: dataEntry.cases - lineData[index - 1].cases,
                        deaths: dataEntry.cases - lineData[index - 1].cases
                    }
                }
            })
        })
    }

    const titleForCaseGraph = isRelativeData ? (
        isDailyData ? "Percent Infected Daily" : "Total Percent Infected"
    ) : (
        isDailyData ? "Number Infected Daily" : "Total Number Infected"
    )

    const titleForDeathGraph = isRelativeData ? (
        isDailyData ? "Percent Dying Daily" : "Total Percent Dead"
    ) : (
        isDailyData ? "Number Dying Daily" : "Total Number Dead"
    )

    return (
        <Column>
            <Row>
                <LabelledSwitch label={"View Daily?"} onChange={setIsDailyData} checked={isDailyData} />
                <LabelledSwitch label={"View Relative?"} onChange={setIsRelativeData} checked={isRelativeData} />
            </Row>
            <Graph 
                style={{ width: '100%' }}
                data={graphingData} 
                yName='cases' 
                title={titleForCaseGraph}
                color={colors.primary} />
            <Graph 
                style={{ width: '100%' }}
                data={graphingData} 
                yName='deaths' 
                title={titleForDeathGraph} 
                color={colors.text.onBackground}/>
        </Column>
    )
}