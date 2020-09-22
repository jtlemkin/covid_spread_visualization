import React from 'react'
import styled from 'styled-components'
import * as d3 from 'd3';
import CSS from 'csstype'

const Container = styled.div`
    flex: 1;
    flex-direction: column-reverse;
`

const Column = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`

const LabelledValue = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: -10px;
    margin-bottom: -10px;
`

const Box = styled.div`
    height: 10px;
    width: 30px;
    border-color: black;
    border-width: 1px;
    border-style: solid;
    margin-right: 5px;
`

const Label = styled.p`
    font-size: 0.75em;
`

interface ScaleProps {
    max: number,
    style?: CSS.Properties
}

export const Scale = ({ max, style }: ScaleProps) => {
    const color = (index: number) => {
        const t = index / 6
        return d3.interpolateYlOrRd(t)
    }

    const label = (index: number) => {
        const upperBound = index / 6 * max * 100
        return index === 0 ? `  ${Math.ceil(upperBound)}%` : `< ${Math.ceil(upperBound)}%`
    }

    return (
        <Container style={style}>
            <Column>
                {[0,1,2,3,4,5,6].map(index => {
                    return (
                        <LabelledValue key={index.toString()}>
                            <Box style={{backgroundColor: color(index)}} />
                            <Label>{label(index)}</Label>
                        </LabelledValue>
                    )
                })}
            </Column>
        </Container>
    )
}