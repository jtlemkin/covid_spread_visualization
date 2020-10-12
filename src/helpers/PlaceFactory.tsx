import places from '../data/places.json'
import populations from '../data/populations.json'
import { Place } from '../interfaces'

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

    const place: Place = {
        fips,
        name,
        type,
        getPopulation,
        contains,
        getOwner,
    }

    return place
}

export default PlaceFactory