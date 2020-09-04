import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import useWindowSize from './useWindowSize'

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

    return (
        <div style={{maxWidth: windowSize.height * 975 / 610}}>
            <svg
            className="container"
            ref={(ref: SVGSVGElement) => containerRef = ref}
            viewBox={`0 0 975 610`}>
                <g fill="none" stroke="#000" strokeLinejoin="round" strokeLinecap="round">
                    <path stroke="#aaa" strokeWidth={0.5} d={countiesPath} ></path>
                    <path strokeWidth={0.5} d={statesPath} ></path>
                    <path d={nationPath}></path>
                </g>
            </svg>
        </div>
    );
}
