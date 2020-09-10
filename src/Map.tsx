import React, { useState } from 'react';
import styled from 'styled-components';
import { FilterableList } from './FilterableList'
import useCanvas from './useCanvas'
import { getRenderer } from './mapRenderer'
import useWindowSize from './useWindowSize'
import places from './places.json'
import * as d3 from 'd3'

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-item: stretch;
`

const AsLargeAsPossibleDiv = styled.div`
    flex: 1;
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

export function Map() {
    const [previousFips, setPreviousFips] = useState(0)
    const [currentFips, setSelectedFips] = useState(0)

    const selectCounty = (newFip: number) => {
        setPreviousFips(currentFips)
        setSelectedFips(newFip)
    }

    const canvasRef = useCanvas(getRenderer(currentFips, previousFips))
    const windowSize = useWindowSize()
    const maxMapWidth = windowSize.height * 975 / 610
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    return (
        <Row>
            <FilterableList data={places} onClick={selectCounty} />
            <AsLargeAsPossibleDiv style={{maxWidth: maxMapWidth}}>
                <canvas ref={canvasRef} width={width} height={height} style={{width, maxWidth: '100%'}}></canvas>
            </AsLargeAsPossibleDiv>
            <div>
                <p>Number of Cases Over Time</p>
                <OutlinedBox />
                <p>Number of Deaths Over Time</p>
                <OutlinedBox />
            </div>
        </Row>
    )
}
