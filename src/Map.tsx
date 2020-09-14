import React from 'react';
import styled from 'styled-components';
import useCanvas from './useCanvas'
import { getRenderer } from './mapRenderer'
import useWindowSize from './useWindowSize'
import CSS from 'csstype'


const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-item: stretch;
`

const Container = styled.div`
    flex: 1;
`

// A fips number is an identifier for counties, states, and the nation

interface MapProps {
    currentFips: number,
    previousFips: number,
    style?: CSS.Properties
}

export const Map = ({ currentFips, previousFips, style}: MapProps) => {
    const canvasRef = useCanvas(getRenderer(currentFips, previousFips))
    const windowSize = useWindowSize()
    const maxMapWidth = windowSize.height * 975 / 610
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    return (
        <Row style={style}>
            <Container style={{maxWidth: maxMapWidth}}>
                <canvas ref={canvasRef} width={width} height={height} style={{width, maxWidth: '100%'}}></canvas>
            </Container>
        </Row>
    )
}