import React from 'react'
import styled from 'styled-components'
import { Graph } from './Graph'
import { Checkbox } from './atoms/Checkbox'
import { Dated } from './interfaces'

const Column = styled.div`
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
        <Row>
            <p style={{paddingRight: '5px', paddingLeft: '5px'}}>{label}</p>
            <Checkbox onChange={onChange} isChecked={checked} />
        </Row>
    )
}

interface GraphDashboardProps {
    graphData: {
        values: Dated[][],
        title: string,
        color: string,
    }[]
    switchData: {
        label: string,
        value: boolean,
        onValueChange: (newValue: boolean) => void
    }[],
}

export const GraphDashboard = ({ graphData, switchData }: GraphDashboardProps) => {
    return (
        <Column>
            <Row>
                {switchData.map(data => {
                    return <LabelledSwitch label={data.label} onChange={data.onValueChange} checked={data.value} />
                })}
            </Row>
            {graphData.map(data => {
                return (
                    <Graph
                        style={{ width: '100%' }}
                        data={data.values}
                        title={data.title}
                        color={data.color} />
                )
            })}
        </Column>
    )
}