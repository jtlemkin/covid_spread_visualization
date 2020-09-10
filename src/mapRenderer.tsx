import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import cities from './cities.json'
import PlaceFactory from './PlaceFactory'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

// Draws a single frame of the map
function drawMap(context: CanvasRenderingContext2D, t: number, selectedPlace: any, previousPlace: any) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    usUntyped.objects.counties.geometries.forEach(county => {
        const fip = parseInt(county.id)
        if (selectedPlace.contains(fip) || previousPlace.contains(fip)) {
            context.beginPath()
            path(topojson.feature(us, county as GeometryObject))

            if (selectedPlace.contains(fip) && previousPlace.contains(fip)) {
                context.fillStyle = "#aaa"
            } else if (selectedPlace.contains(fip)) {
                context.fillStyle = d3.interpolateRgb("white", "#aaa")(t)
            } else {
                context.fillStyle = d3.interpolateRgb("#aaa", "white")(t)
            }

            context.fill()
        }
    })
}

function drawCapitalLabels(context: CanvasRenderingContext2D) {
    cities.forEach((city: City) => {
        const [x, y] = projection([city.lng, city.lat])!
        context.textAlign = "center"
        context.fillText(city.name, x, y - 6)

        context.beginPath()
        context.arc(x, y, 2, 0, 2 * Math.PI)
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
export const getRenderer = (selectedFips: number, previousFips: number) => {
    return (context: CanvasRenderingContext2D, t: number) => {
        context.lineJoin = "round"
        context.lineCap = "round"

        const selectedPlace = PlaceFactory(selectedFips)
        const previousPlace = PlaceFactory(previousFips)

        const transform = getTransform(selectedPlace, previousPlace, t)

        context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight)

        context.save()

        if (transform) {
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)
        }

        drawMap(context, t, selectedPlace, previousPlace)
        drawCapitalLabels(context)

        context.restore()
    }
}

interface City {
    name: string,
    lat: number,
    lng: number,
}