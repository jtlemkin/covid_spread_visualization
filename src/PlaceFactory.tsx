import * as d3 from 'd3';
import usUntyped from './counties-albers-10m.json'
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'

const MAP_SIZE = [975, 610]

const PlaceFactory = (fips: number) => {
    const geometry = fips === 0 ? (
        usUntyped.objects.nation
    ) : (
        fips % 1000 === 0 ? (
            usUntyped.objects.states.geometries.find(state => parseInt(state.id) === fips / 1000)
        ) : (
            usUntyped.objects.counties.geometries.find(county => parseInt(county.id) === fips)
        )
    )

    const path = d3.geoPath()
    const us = (usUntyped as unknown) as Topology
    const bounds = path.bounds(topojson.feature(us, geometry as GeometryObject))
    const height = bounds[1][1] - bounds[0][1]
    const width = bounds[1][0] - bounds[0][0]
    // The US is a special case where it seems like the center calculated this way causes maine to be cut off
    const center = fips === 0 ? (
        [MAP_SIZE[0] / 2, MAP_SIZE[1] / 2]
    ) : (
        [
            (bounds[1][0] + bounds[0][0]) / 2,
            (bounds[1][1] + bounds[0][1]) / 2
        ]
    )
    const scale = MAP_SIZE[1] / height
    const translation = [center[0] - MAP_SIZE[0] / 2, center[1] - MAP_SIZE[1] / 2]
    const scaleAdjustedTranslation = [
        MAP_SIZE[0] / 2 - scale * (MAP_SIZE[0] / 2 + translation[0]),
        MAP_SIZE[1] / 2 - scale * (MAP_SIZE[1] / 2 + translation[1]),
    ]
    const contains = (otherFips: number) => {
        if (fips === 0) {
            return true
        } else if (fips % 1000 === 0) {
            return fips / 1000 === Math.floor(otherFips / 1000)
        } else {
            return fips === otherFips
        }
    }

    return ({
        fips,
        scale,
        scaleAdjustedTranslation,
        contains
    })
}

export default PlaceFactory