import React from 'react'
import styled from 'styled-components'
import CSS from 'csstype'
import { LabelledColor } from './interfaces'

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-items: space-evenly;
    max-width: 600px;
    margin: auto;
`

const LabelledValue = styled.div`
    display: flex;
    flex-direction: column-reverse;
    flex: 1;
    margin-left: 2.5px;
    margin-right: 2.5px;
    align-items: center;
`

const Box = styled.div`
    height: 10px;
    width: 100%;
    border-color: #D3D3D3;
    border-width: 0.5px;
    border-style: solid;
`

const Label = styled.p`
    font-size: 0.75em;
    margin-top: 2px;
`

interface LegendProps {
    labelledColors: LabelledColor[]
    style?: CSS.Properties
}

export const Legend = ({ labelledColors, style }: LegendProps) => {
    return (
        <div style={style}>
            <Row>
                { labelledColors.map(({ label, color }, index) => {
                    return (
                        <LabelledValue key={index.toString()}>
                            <Label>{label}</Label>
                            <Box style={{backgroundColor: color}} />
                        </LabelledValue>
                    )
                }) }
            </Row>
        </div>
    )
}