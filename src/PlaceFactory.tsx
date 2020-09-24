import * as d3 from 'd3';
import usUntyped from './data/counties-albers-10m.json'
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import places from './data/places.json'
import populations from './data/populations.json'
import { Place, Transform } from './interfaces'

const MAP_SIZE = [975, 610]
const populationsUntyped = (populations as any);
const newYorkCityFips = [36061, 36047, 36081, 36005, 36085]

function getPopulationsKey(fips: number) {
    if (newYorkCityFips.includes(fips)) {
        return "NYC"
    } else if (fips.toString().length < 5) {
        return `0${fips}`
    } else {
        return fips.toString()
    }
}

const PlaceFactory = (fips: number) => {
    const name: string = (places as any)[fips]!
    const type = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county")

    const contains = (otherFips: number) => {
        if (fips === 0) {
            return true
        } else if (fips % 1000 === 0) {
            return fips / 1000 === Math.floor(otherFips / 1000)
        } else {
            return fips === otherFips
        }
    }

    const getOwner = () => {
        return type === "nation" ? null : (
            type === "state" ? PlaceFactory(0) : (
                PlaceFactory(Math.floor(fips / 1000) * 1000)
            )
        )
    }
    
    const getPopulation = () => {
        if (type === "nation") {
            return 328_200_000
        } else if (type === "state") {
            return Object.keys(populationsUntyped).reduce((population, fips) => {
                if (contains(parseInt(fips))) {
                    population += populationsUntyped[getPopulationsKey(parseInt(fips))]
                }

                return population
            }, 0)
        }

        if (fips === 2158) {
            return 8316;
        } else if (newYorkCityFips.includes(fips)) {
            return 8_399_000
        } else {
            return populationsUntyped[getPopulationsKey(fips)] as number
        }
    }

    const getTransform = () => {
        const geometry = fips === 0 ? (
            usUntyped.objects.nation
        ) : (
            fips % 1000 === 0 ? (
                usUntyped.objects.states.geometries.find(state => parseInt(state.id) === fips / 1000)
            ) : (
                usUntyped.objects.counties.geometries.find(county => parseInt(county.id) === fips)
            )
        )

        const us = (usUntyped as unknown) as Topology
        const path = d3.geoPath()
        const bounds = path.bounds(topojson.feature(us, geometry as GeometryObject))
        const height = bounds[1][1] - bounds[0][1]
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
        const scaleAdjustedTranslation: [number, number] = [
            MAP_SIZE[0] / 2 - scale * (MAP_SIZE[0] / 2 + translation[0]),
            MAP_SIZE[1] / 2 - scale * (MAP_SIZE[1] / 2 + translation[1]),
        ]

        const transform: Transform = { scale, scaleAdjustedTranslation }
        return transform
    }

    const place: Place = {
        fips,
        name,
        type,
        getPopulation,
        getTransform,
        contains,
        getOwner,
    }

    return place
}

export default PlaceFactory