import React from 'react'
import styled from 'styled-components'
import * as d3 from 'd3';

const Container = styled.div`
    flex: 1;
    flex-direction: column;
    margin-top: 10px;
`

const Row = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const LabelledValue = styled.div`
    width: calc(90% / 7);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;   
`

const Box = styled.div`
    height: 10px;
    width: 100%;
`

interface ScaleProps {
    max: number
}

export const Scale = (props: ScaleProps) => {
    const { max } = props

    const color = (index: number) => {
        const t = 1 - index / 6
        return d3.interpolateInferno(t)
    }

    const label = (index: number) => {
        const upperBound = index / 6 * max * 100
        return index === 0 ? `${upperBound.toFixed(2)}%` : `< ${upperBound.toFixed(2)}%`
    }

    return (
        <Container>
            <h3>Percent of County Reported to Have Been Infected</h3>
            <Row>
                {[0,1,2,3,4,5,6].map(index => {
                    return (
                        <LabelledValue>
                            <Box style={{backgroundColor: color(index)}} />
                            <p>{label(index)}</p>
                        </LabelledValue>
                    )
                })}
            </Row>
        </Container>
    )
}