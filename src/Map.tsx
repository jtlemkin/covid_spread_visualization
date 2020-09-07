import React, { useState } from 'react';
import styled from 'styled-components';
import usUntyped from './counties-albers-10m.json'
import { FilterableList } from './FilterableList'
import useCanvas from './useCanvas'
import { getRenderer } from './mapRenderer'
import useWindowSize from './useWindowSize'

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-item: stretch;
`

const AsLargeAsPossibleDiv = styled.div`
    flex: 1;
`

export function Map() {
    const counties = usUntyped.objects.counties.geometries
    const searchData = counties.map(county => {
        return {
            label: county.properties.name,
            id: county.id.toString()
        }
    })

    const [selectedCountyID, setSelectedCountyID] = useState<string | null>(null)

    const selectCounty = (county: DataPoint) => {
        setSelectedCountyID(county.id)
    }

    const canvasRef = useCanvas(getRenderer(selectedCountyID))
    const windowSize = useWindowSize()

    console.log("Size", windowSize)
    console.log(canvasRef.current?.width, canvasRef.current?.height)

    return (
        <Row>
            <FilterableList data={searchData} onClick={selectCounty} />
            <AsLargeAsPossibleDiv style={{maxWidth: windowSize.height * 975 / 610}}>
                <canvas ref={canvasRef}></canvas>
            </AsLargeAsPossibleDiv>
        </Row>
    )
}

interface DataPoint {
    label: string,
    id: string,
}