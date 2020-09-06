import React, { useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import useWindowSize from './useWindowSize'
import { FilterableList } from './FilterableList'

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-item: stretch;
`

const ExpandingDiv = styled.div`
    flex: 1;
`

export function Map() {
    let containerRef: SVGSVGElement;
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])
    const path = d3.geoPath()
    const us = (usUntyped as unknown) as Topology
    const countiesPath = path(topojson.mesh(
        us, 
        us.objects.counties as GeometryObject, 
        (a: any, b: any) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)
    )) ?? ""
    const statesPath = path(topojson.mesh(us, us.objects.states as GeometryObject, (a, b) => a !== b)) ?? ""
    const nationPath = path(topojson.feature(us, us.objects.nation as GeometryObject)) ?? ""

    const windowSize = useWindowSize()

    console.log(us)

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

    return (
        <Row>
            <FilterableList data={searchData} onClick={selectCounty} />
            <ExpandingDiv style={{maxWidth: windowSize.height * 975 / 610}}>
                <svg
                className="container"
                ref={(ref: SVGSVGElement) => containerRef = ref}
                viewBox={`0 0 975 610`}>
                    <g fill="none" stroke="#000" strokeLinejoin="round" strokeLinecap="round">
                        {counties.map(countyGeometry => {
                            const countyPath = path(topojson.feature(us, countyGeometry as GeometryObject)) ?? ""
                            const color = selectedCountyID !== null && selectedCountyID === countyGeometry.id ? (
                                'red'
                            ) : (
                                undefined
                            )
                            return <path stroke="#aaa" strokeWidth={0.5} fill={color} d={countyPath} key={countyGeometry.id}></path>
                        })}
                        <path strokeWidth={0.5} d={statesPath} ></path>
                        <path d={nationPath}></path>
                    </g>
                </svg>
            </ExpandingDiv>
        </Row>
    );
}

interface DataPoint {
    label: string,
    id: string,
}