import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from '../data/counties-albers-10m.json'
import cities from '../data/cities.json'
import PlaceFactory from './PlaceFactory'
import { Snapshot, Place, City } from '../interfaces'
import colors from '../colors'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

function drawCounties(
    context: CanvasRenderingContext2D,
    snapshot: Snapshot<number>,
    t: number,
    percentile: number,
    selectedPlace: Place,
    previousPlace: Place
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    usUntyped.objects.counties.geometries.forEach((county) => {
        const fips = parseInt(county.id)
        const value: number | undefined = snapshot.statistics.get(fips)
        const normalizedValue = value !== undefined ? (
            value / percentile
        ) : ( 
            0
        )

        const colorIndex = normalizedValue > 1 ? (
            colors.scale.length - 1
        ) : (
            Math.ceil(normalizedValue * (colors.scale.length - 1))
        )
        const countyColor = colors.scale[colorIndex]

        context.lineWidth = 0.1

        if (selectedPlace.contains(fips) || previousPlace.contains(fips)) {
            if (selectedPlace.contains(fips) && previousPlace.contains(fips)) {
                context.fillStyle = countyColor
                context.strokeStyle = colors.text.onBackground
            } else if (selectedPlace.contains(fips)) {
                context.fillStyle = d3.interpolate(colors.background, countyColor)(t)
                context.strokeStyle = d3.interpolate(colors.background, colors.text.onBackground)(t)
            } else {
                context.fillStyle = d3.interpolate(countyColor, colors.background)(t)
                context.strokeStyle = d3.interpolate(colors.text.onBackground, colors.background)(t)
            }

            context.beginPath()
            path(topojson.feature(us, county as GeometryObject))
            context.fill()
            context.stroke()
        }
    })
}

function drawStates(
    context: CanvasRenderingContext2D,
    t: number,
    selectedPlace: Place,
    previousPlace: Place
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    usUntyped.objects.states.geometries.forEach(state => {
        const fips = parseInt(state.id)

        context.lineWidth = 0.2

        if (selectedPlace.contains(fips) || previousPlace.contains(fips)) {
            if (selectedPlace.contains(fips) && previousPlace.contains(fips)) {
                context.strokeStyle = colors.text.onBackground
            } else if (selectedPlace.contains(fips)) {
                context.strokeStyle = d3.interpolate(colors.background, colors.text.onBackground)(t)
            } else {
                context.strokeStyle = d3.interpolate(colors.text.onBackground, colors.background)(t)
            }

            context.beginPath()
            path(topojson.feature(us, state as GeometryObject))
            context.stroke()
        }
    })
}

function drawNation(
    context: CanvasRenderingContext2D,
    t: number,
    selectedPlace: Place,
    previousPlace: Place
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    context.lineWidth = 0.5
    if (selectedPlace.fips === 0 || previousPlace.fips === 0) {
        if (selectedPlace.fips === 0 && previousPlace.fips === 0) {
            context.strokeStyle = colors.text.onBackground
        } else if (selectedPlace.fips === 0) {
            context.strokeStyle = d3.interpolate(colors.background, colors.text.onBackground)(t)
        } else {
            context.strokeStyle = d3.interpolate(colors.text.onBackground, colors.background)(t)
        }

        path(topojson.feature(us, us.objects.nation))
        context.stroke()
    }
}

// Draws a single frame of the map
function drawMap(
    context: CanvasRenderingContext2D, 
    t: number, 
    snapshot: Snapshot<number>,
    percentile: number,
    selectedPlace: Place, 
    previousPlace: Place
) {
    drawCounties(context, snapshot, t, percentile, selectedPlace, previousPlace)
    drawStates(context, t, selectedPlace, previousPlace)
    drawNation(context, t, selectedPlace, previousPlace)
}

function drawCitiesLabels(context: CanvasRenderingContext2D, t: number, selectedPlace: Place, previousPlace: Place) {
    cities.forEach((city: City) => {
        const [x, y] = projection([city.lng, city.lat])!
        context.textAlign = "center"

        if (selectedPlace.contains(city.county_fips) || previousPlace.contains(city.county_fips)) {
            let lineColor = "rgba(0,0,0,0)"
            let outlineColor = "rgba(1,1,1,0)"
            if (selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
                lineColor = 'black'
                outlineColor = 'white'
            } else if (selectedPlace.contains(city.county_fips) && !previousPlace.contains(city.county_fips)) {
                lineColor = d3.interpolateString("rgba(0,0,0,0)", "rgba(0,0,0,1)")(t)
                outlineColor = d3.interpolateString("rgba(1,1,1,0)", "rgba(1,1,1,1)")(t)
            } else if (!selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
                lineColor = d3.interpolateString("rgba(0,0,0,1)", "rgba(0,0,0,0)")(t)
                outlineColor = d3.interpolateString("rgba(1,1,1,1)", "rgba(1,1,1,0)")(t)
            }

            const previousTransform = previousPlace.getTransform()
            const selectedTransform = selectedPlace.getTransform()

            const scalingFactor = d3.interpolate(1 / Math.sqrt(previousTransform.scale), 1 / Math.sqrt(selectedTransform.scale))(t)
            const fontSize = 11 * scalingFactor

            context.font = `${fontSize}px Arial`
            context.lineWidth = 0.5
            context.strokeStyle = outlineColor
            context.strokeText(city.name, x, y - 6 * scalingFactor)
            context.fillStyle = lineColor
            context.fillText(city.name, x, y - 6 * scalingFactor)

            context.fillStyle = lineColor
            context.beginPath()
            context.arc(x, y, 2 * scalingFactor, 0, 2 * Math.PI)
            context.fill()
        }
    })
}

function getTransform(selectedPlace: Place, previousPlace: Place, t: number) {
    const previousTransform = previousPlace.getTransform()
    const selectedTransform = selectedPlace.getTransform()

    const scales = d3.interpolate(previousTransform.scale, selectedTransform.scale)
    const translations = d3.interpolate(
        previousTransform.scaleAdjustedTranslation, 
        selectedTransform.scaleAdjustedTranslation
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
export const getRenderer = (
    selectedFips: number, 
    previousFips: number,
    snapshot: Snapshot<number>,
    percentile: number
) => {
    return (context: CanvasRenderingContext2D, t: number) => {
        context.lineJoin = "round"
        context.lineCap = "round"

        const selectedPlace = PlaceFactory(selectedFips)
        const previousPlace = PlaceFactory(previousFips)

        const transform = getTransform(selectedPlace, previousPlace, t)

        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
        context.save()
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)

        drawMap(context, t, snapshot, percentile, selectedPlace, previousPlace)
        drawCitiesLabels(context, t, selectedPlace, previousPlace)

        context.restore()
    }
}