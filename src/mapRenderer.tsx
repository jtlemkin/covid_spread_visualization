import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import cities from './data/cities.json'
import PlaceFactory from './PlaceFactory'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

// Draws a single frame of the map
function drawMap(
    context: CanvasRenderingContext2D, 
    t: number, 
    rates: Map<number, number> | null, 
    selectedPlace: any, 
    previousPlace: any
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    // Draw the US
    path(topojson.feature(us, us.objects.nation as GeometryObject))
    context.lineWidth = 1
    context.stroke()

    // Draw state border
    path(topojson.mesh(us, us.objects.states as GeometryObject, (a, b) => a !== b))
    context.lineWidth = 0.5
    context.stroke()

    usUntyped.objects.counties.geometries.forEach((county, index) => {
        const fips = parseInt(county.id)
        const t = rates?.get(fips)
        const countyColors = d3.interpolateHcl('#ffffff', '#000000')
        const countyColor = t ? countyColors(t) : "blue"

        context.beginPath()
        path(topojson.feature(us, county as GeometryObject))

        context.fillStyle = countyColor
        context.fill()

        if (selectedPlace.fips === fips) {
            context.stroke()
        }
    })
}

function drawCitiesLabels(context: CanvasRenderingContext2D, t: number, selectedPlace: any, previousPlace: any) {
    cities.forEach((city: City) => {
        const [x, y] = projection([city.lng, city.lat])!
        context.textAlign = "center"

        if (selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
            context.fillStyle = "black"
        } else if (selectedPlace.contains(city.county_fips) && !previousPlace.contains(city.county_fips)) {
            context.fillStyle = d3.interpolateString("rgba(0,0,0,0)", "rgba(0,0,0,1)")(t)
        } else if (!selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
            context.fillStyle = d3.interpolateString("rgba(0,0,0,1)", "rgba(0,0,0,0)")(t)
        } else {
            context.fillStyle = "rgba(0,0,0,0)"
        }

        const scalingFactor = d3.interpolate(1 / Math.sqrt(previousPlace.scale), 1 / Math.sqrt(selectedPlace.scale))(t)
        const fontSize = 11 * scalingFactor
        context.font = `${fontSize}px Arial`
        context.lineWidth = 1
        context.strokeStyle = "white"
        context.strokeText(city.name, x, y - 6 * scalingFactor)
        context.fillStyle = 'black'
        context.fillText(city.name, x, y - 6 * scalingFactor)

        context.beginPath()
        context.arc(x, y, 2 * scalingFactor, 0, 2 * Math.PI)
        context.fill()
    })
}

function getTransform(selectedPlace: any, previousPlace: any, t: number) {
    const scales = d3.interpolate(previousPlace.scale, selectedPlace.scale)
    const translations = d3.interpolate(
        previousPlace.scaleAdjustedTranslation, 
        selectedPlace.scaleAdjustedTranslation
    )

    const transformParams = {
        a: scales(t),
        b: 0,
        c: 0,
        d: scales(t),
        e: translations(t)[0],
        f: translations(t)[1],
    }

    return transformParams
}

// Returns a rendering function that the canvas hook can call
export const getRenderer = (selectedFips: number, previousFips: number, rates: Map<number, number> | null) => {
    return (context: CanvasRenderingContext2D, t: number) => {
        context.lineJoin = "round"
        context.lineCap = "round"

        const selectedPlace = PlaceFactory(selectedFips)
        const previousPlace = PlaceFactory(previousFips)

        const transform = getTransform(selectedPlace, previousPlace, t)

        context.save()

        context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight)

        if (transform) {
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)
        }

        context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight)

        drawMap(context, t, rates, selectedPlace, previousPlace)
        drawCitiesLabels(context, t, selectedPlace, previousPlace)

        context.restore()
    }
}

interface City {
    name: string,
    lat: number,
    lng: number,
    county_fips: number,
}