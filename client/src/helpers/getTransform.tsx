import * as d3 from 'd3';
import usUntyped from '../data/counties-albers-10m.json'
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import { Transform } from '../interfaces'

const MAP_SIZE = [975, 610]

const getTransform = (fips: number) => {
    // If looking at the US there is no transform
    if (fips === 0) {
        return { scale: 1, scaleAdjustedTranslation: [0, 0] } as Transform
    }

    const geometry = fips % 1000 === 0 ? (
        usUntyped.objects.states.geometries.find(state => parseInt(state.id) === fips / 1000)
    ) : (
        usUntyped.objects.counties.geometries.find(county => parseInt(county.id) === fips)
    )

    const us = (usUntyped as unknown) as Topology
    const path = d3.geoPath()
    const bounds = path.bounds(topojson.feature(us, geometry as GeometryObject))
    const height = bounds[1][1] - bounds[0][1]
    const width = bounds[1][0] - bounds[0][0]
    // The US is a special case where it seems like the center calculated this way causes maine to be cut off
    const center = [
        (bounds[1][0] + bounds[0][0]) / 2,
        (bounds[1][1] + bounds[0][1]) / 2
    ]
    const scale = Math.min(MAP_SIZE[1] / height, MAP_SIZE[0] / width)
    const translation = [center[0] - MAP_SIZE[0] / 2, center[1] - MAP_SIZE[1] / 2]
    const scaleAdjustedTranslation: [number, number] = [
        MAP_SIZE[0] / 2 - scale * (MAP_SIZE[0] / 2 + translation[0]),
        MAP_SIZE[1] / 2 - scale * (MAP_SIZE[1] / 2 + translation[1]),
    ]

    const transform: Transform = { scale, scaleAdjustedTranslation }
    return transform
}

export default getTransform