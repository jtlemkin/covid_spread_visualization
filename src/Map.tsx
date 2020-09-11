import React from 'react';
import styled from 'styled-components';
import useCanvas from './useCanvas'
import { getRenderer } from './mapRenderer'
import useWindowSize from './useWindowSize'
import PropTypes, { InferProps } from "prop-types"

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-item: stretch;
`

const Container = styled.div`
    flex: 1;
    padding: 75px 25px 0px 25px;
`

const OutlinedBox = styled.div`
    width: 250px;
    height: 250px;
    border-style: solid;
    border-width: 2px;
    border-color: 'black';
    margin: 10px;
`

// A fips number is an identifier for counties, states, and the nation

export function Map({currentFips, previousFips}: InferProps<typeof Map.propTypes>) {
    const canvasRef = useCanvas(getRenderer(currentFips, previousFips))
    const windowSize = useWindowSize()
    const maxMapWidth = windowSize.height * 975 / 610
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    return (
        <Row>
            <Container style={{maxWidth: maxMapWidth}}>
                <canvas ref={canvasRef} width={width} height={height} style={{width, maxWidth: '100%'}}></canvas>
            </Container>
        </Row>
    )
}

Map.propTypes = {
    currentFips: PropTypes.number.isRequired,
    previousFips: PropTypes.number.isRequired
}

/*
<div>
    <p>Number of Cases Over Time</p>
    <OutlinedBox />
    <p>Number of Deaths Over Time</p>
    <OutlinedBox />
</div> */