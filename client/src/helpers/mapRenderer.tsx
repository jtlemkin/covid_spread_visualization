import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from '../data/counties-albers-10m.json'
import getTransform from './getTransform'
import PlaceFactory from './PlaceFactory'
import { Snapshot, Place, City, Transform } from '../interfaces'
import colors from '../colors'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

function colorForCounty(fips: number, snapshot: Snapshot, percentile: number) {
    const value: number | null | undefined = snapshot.statistics[fips.toString()]

    // Return a color indictating we have no data
    if (value === undefined || value === null) {
        return colors.no_data
    }

    // Percentile is a bad name for the point in which if value > percentile 
    // then value is in the the top category. The percentile is set accordingly 
    // to prevent outliers from creating categories that only include few 
    // counties and leaving the rest of the counties in overfilled categories.
    // Thus making the graph look dull and indiscernible 
    const normalizedValue = value / percentile
    const colorIndex = normalizedValue > 1 ? (
        // Color is in the top category
        colors.scale.length - 1
    ) : (
        // Find index to put category in equidistant lesser categories
        Math.floor(normalizedValue * (colors.scale.length - 1))
    )
    return colors.scale[colorIndex]
}

function drawCounties(
    context: CanvasRenderingContext2D,
    snapshot: Snapshot,
    t: number,
    percentile: number,
    selectedPlace: Place,
    previousPlace: Place,
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    context.lineWidth = 0.2
    context.strokeStyle = colors.background

    usUntyped.objects.counties.geometries.forEach((county) => {
        const fips = parseInt(county.id)
        const countyColor = colorForCounty(fips, snapshot, percentile)

        if (selectedPlace.contains(fips) || previousPlace.contains(fips)) {
            if (selectedPlace.contains(fips) && previousPlace.contains(fips)) {
                context.fillStyle = countyColor
            } else if (selectedPlace.contains(fips)) {
                context.fillStyle = d3.interpolate(colors.background, countyColor)(t)
            } else {
                context.fillStyle = d3.interpolate(countyColor, colors.background)(t)
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
    selectedPlace: Place,
    previousPlace: Place,
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology
    context.strokeStyle = colors.background

    usUntyped.objects.states.geometries.forEach(state => {
        const fips = parseInt(state.id)

        context.lineWidth = 1.75

        if (selectedPlace.contains(fips) || previousPlace.contains(fips)) {
            context.beginPath()
            path(topojson.feature(us, state as GeometryObject))
            context.stroke()
        }
    })
}

function highlightPlace(place: Place | null, context: CanvasRenderingContext2D) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology
    if (place && place.type !== "nation") {
        const id = place.type === "state" ? place.fips / 1000 : place.fips
        const geometries = place.type === "state" ? (
            usUntyped.objects.states.geometries
        ) : (
            usUntyped.objects.counties.geometries
        )
        const geometry = geometries.find(geometry => parseInt(geometry.id) === id)

        context.lineWidth = place.type === "state" ? 1.75 : 1.75 / 4
        context.strokeStyle = 'black'
        context.beginPath()
        path(topojson.feature(us, geometry as GeometryObject))
        context.stroke()
    }
}

// Draws a single frame of the map
function drawMap(
    context: CanvasRenderingContext2D, 
    t: number, 
    snapshot: Snapshot,
    percentile: number,
    selectedPlace: Place, 
    previousPlace: Place,
) {
    drawCounties(context, snapshot, t, percentile, selectedPlace, previousPlace)
    drawStates(context, selectedPlace, previousPlace)
}

function drawCitiesLabels(
    context: CanvasRenderingContext2D, 
    t: number, 
    selectedPlace: Place, 
    previousPlace: Place, 
    currentScale: number,
    cities: City[]
) {
    cities.forEach((city: City) => {
        const [x, y] = projection([city.lng, city.lat])!
        context.textAlign = "center"

        if (selectedPlace.contains(city.county_fips) || previousPlace.contains(city.county_fips)) {
            let fillColor = "rgba(0,0,0,0)"
            let outlineColor = "rgba(1,1,1,0)"
            if (selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
                fillColor = 'black'
                outlineColor = 'white'
            } else if (selectedPlace.contains(city.county_fips) && !previousPlace.contains(city.county_fips)) {
                fillColor = d3.interpolate(colors.background, "black")(t)
                outlineColor = d3.interpolate(colors.background, "white")(t)
            } else if (!selectedPlace.contains(city.county_fips) && previousPlace.contains(city.county_fips)) {
                fillColor = d3.interpolate("black", colors.background)(t)
                outlineColor = d3.interpolate("white", colors.background)(t)
            }

            const scalingFactor = 1 / currentScale
            const fontSize = 16 * scalingFactor

            context.font = `${fontSize}px Arial`
            context.lineWidth = 2 * scalingFactor
            context.strokeStyle = outlineColor
            context.strokeText(city.name, x, y - 6 * scalingFactor)
            context.fillStyle = fillColor
            context.fillText(city.name, x, y - 6 * scalingFactor)

            context.fillStyle = fillColor
            context.beginPath()
            context.arc(x, y, 2 * scalingFactor, 0, 2 * Math.PI)
            context.fill()
        }
    })
}

function interpolateTransforms(previousTransform: Transform, selectedTransform: Transform, t: number) {
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
    snapshot: Snapshot,
    percentile: number,
    cities: City[],
    highlightedFips: number | null
) => {
    const previousTransform = getTransform(previousFips)
    const selectedTransform = getTransform(selectedFips)

    return (context: CanvasRenderingContext2D, t: number) => {
        context.lineJoin = "round"
        context.lineCap = "round"

        const transform = interpolateTransforms(previousTransform, selectedTransform, t)

        context.restore()
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
        context.save()
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)

        const selectedPlace = PlaceFactory(selectedFips)
        const previousPlace = PlaceFactory(previousFips)
        const highlightedPlace = highlightedFips ? PlaceFactory(highlightedFips) : null

        drawMap(context, t, snapshot, percentile, selectedPlace, previousPlace)
        drawCitiesLabels(context, t, selectedPlace, previousPlace, transform.a, cities) //transform.a is the current transform scale
        highlightPlace(highlightedPlace, context)
    }
}