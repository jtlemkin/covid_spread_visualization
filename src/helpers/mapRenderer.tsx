import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from '../data/counties-albers-10m.json'
import cities from '../data/cities.json'
import PlaceFactory from '../PlaceFactory'
import { Snapshot, Place, City } from '../interfaces'
import colors from '../colors'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

// Draws a single frame of the map
function drawMap(
    context: CanvasRenderingContext2D, 
    t: number, 
    snapshot: Snapshot<number>,
    max: number,
    percentile: number,
    selectedPlace: Place, 
    previousPlace: Place
) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    // Draw the US
    /*path(topojson.feature(us, us.objects.nation as GeometryObject))
    context.lineWidth = 1
    context.stroke()*/

    // Draw state border
    path(topojson.mesh(us, us.objects.states as GeometryObject, (a, b) => a !== b))
    context.lineWidth = 0.5
    context.stroke()

    if (selectedPlace.type === "state") {
        const selectedStates = usUntyped.objects.states.geometries
            .filter((geometry: any) => parseInt(geometry.id) === selectedPlace.fips / 1000)

        if (selectedStates.length > 0) {
            const geometry = selectedStates as Array<any>

            path(topojson.merge(us, geometry))

            context.lineWidth = 1
            context.strokeStyle = colors.text.onBackground
            context.stroke()
        }
    }

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

        context.beginPath()
        path(topojson.feature(us, county as GeometryObject))

        context.fillStyle = countyColor
        context.fill()

        if (selectedPlace.fips === fips) {
            context.lineWidth = 1
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

        const previousTransform = previousPlace.getTransform()
        const selectedTransform = selectedPlace.getTransform()

        const scalingFactor = d3.interpolate(1 / Math.sqrt(previousTransform.scale), 1 / Math.sqrt(selectedTransform.scale))(t)
        const fontSize = 11 * scalingFactor
        context.font = `${fontSize}px Arial`
        context.lineWidth = 1
        context.strokeStyle = "white"
        context.strokeText(city.name, x, y - 6 * scalingFactor)
        context.fillStyle = 'black'
        context.fillText(city.name, x, y - 6 * scalingFactor)

        context.fillStyle = colors.text.onBackground
        context.beginPath()
        context.arc(x, y, 2 * scalingFactor, 0, 2 * Math.PI)
        context.fill()
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

    // If the selected place has not changed, we don't want to animate
    // showing the same place. Setting t := 1 effectively prevents the animation
    // from happening
    const _t = selectedPlace === previousPlace ? 1 : t

    const transformParams = {
        a: scales(_t),
        b: 0,
        c: 0,
        d: scales(_t),
        e: translations(_t)[0],
        f: translations(_t)[1],
    }

    return transformParams
}

// Returns a rendering function that the canvas hook can call
export const getRenderer = (
    selectedFips: number, 
    previousFips: number,
    snapshot: Snapshot<number>,
    max: number,
    percentile: number
) => {
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

        drawMap(context, t, snapshot, max, percentile, selectedPlace, previousPlace)
        drawCitiesLabels(context, t, selectedPlace, previousPlace)

        context.restore()
    }
}