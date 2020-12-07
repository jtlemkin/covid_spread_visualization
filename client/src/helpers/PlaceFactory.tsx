import places from '../data/places.json'
import populations from '../data/populations.json'
import { Place } from '../interfaces'

const populationsUntyped = (populations as any);
const newYorkCityFips = [36061, 36047, 36081, 36005, 36085]

function getPopulationsKey(fips: number) {
    if (fips.toString().length < 5) {
        return `0${fips}`
    } else {
        return fips.toString()
    }
}

const PlaceFactory = (fips: number) => {
    let name = ""
    if (fips === 1) {
        name = "New York City, NY"
    } else {
        name = (places as any)[fips]
        if (!name) {
            name = "Name not found"
        }
    }
    const type = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county")

    const contains = (otherFips: number) => {
        if (fips === 0) {
            return true
        } else if (fips % 1000 === 0) {
            return (fips / 1000 === Math.floor(otherFips / 1000)) || (fips === 36000 && otherFips === 1)
        } else {
            return fips === otherFips
        }
    }

    const getOwner = () => {
        // If NYC return NY
        if (fips === 1) {
            return PlaceFactory(36000)
        }

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
            let pop = Object.keys(populationsUntyped).reduce((population, id) => {
                fips = parseInt(id)
                if (contains(fips) && !newYorkCityFips.includes(fips)) {
                    population += populationsUntyped[getPopulationsKey(fips)]
                }

                return population
            }, 0)

            // If state is New York add the population of New York City because
            // it is a special case not included in our reduce function
            if (fips === 36000) {
                pop += 8_336_817
            }

            return pop
        }

        if (fips === 2158) {
            return 8316;
        } else if (fips === 1) {
            return 8_336_817
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