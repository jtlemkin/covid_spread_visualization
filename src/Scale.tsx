import React from 'react'
import styled from 'styled-components'
import CSS from 'csstype'
import colors from './colors'

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
`

const Box = styled.div`
    height: 10px;
    width: 100%;
`

const Label = styled.p`
    font-size: 0.75em;
    padding-top: 2px;
`

interface ScaleProps {
    max: number,
    percentile: number,
    style?: CSS.Properties
}

export const Scale = ({ max, percentile, style }: ScaleProps) => {
    const numColors = colors.scale.length

    const color = (index: number) => {
        return colors.scale[index]
    }

    const labelValueForIndex = (index: number) => {
        return ((index - 1) / (numColors - 1) * percentile)
    }

    const label = (index: number) => {
        // Here we make the assumption that if the max number we are looking at is less
        // than one that we are actually viewing percentages
        if (max <= 1) {
            if (index === 0) {
                return '0%'
            } else {
                return `> ${(labelValueForIndex(index) * 100).toPrecision(2)}%`
            }
        } else {
            if (index === 0) {
                return 0
            } else if (index < numColors) {
                return `> ${labelValueForIndex(index).toPrecision(2)}`
            }
        }
    }

    return (
        <div style={style}>
            <Row>
                {Array.from({length: numColors}, (x, i) => i).map(index => {
                    return (
                        <LabelledValue key={index.toString()}>
                            <Label>{label(index)}</Label>
                            <Box style={{backgroundColor: color(index)}} />
                        </LabelledValue>
                    )
                })}
            </Row>
        </div>
    )
}