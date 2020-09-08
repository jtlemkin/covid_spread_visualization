import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import cities from './cities.json'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

function drawMap(context: CanvasRenderingContext2D) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    // Draw counties
    context.beginPath()
    path(topojson.mesh(us, us.objects.counties as GeometryObject, (a: any, b: any) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
    context.lineWidth = 0.5;
    context.strokeStyle = "#aaa"
    context.stroke();

    // Fill in selected county
    /*if (selectedCountyID) {
        context.beginPath()
        const county = usUntyped.objects.counties.geometries.find(county => county.id === selectedCountyID)
        path(topojson.feature(us, county as GeometryObject))
        context.fillStyle = 'red'
        context.fill()
    }*/

    // Draw states
    context.beginPath()
    path(topojson.mesh(us, us.objects.states as GeometryObject, (a, b) => a !== b))
    context.lineWidth = 0.5
    context.strokeStyle = 'black'
    context.stroke()

    // Draw nation
    context.beginPath()
    path(topojson.feature(us, us.objects.nation as GeometryObject))
    context.strokeStyle = 'black'
    context.lineWidth = 1
    context.stroke()
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

export const getRenderer = (selectedCountyID: string | null) => {
    return (context: CanvasRenderingContext2D) => {
        console.log(usUntyped)

        context.lineJoin = "round"
        context.lineCap = "round"

        drawMap(context)
        drawCapitalLabels(context)
    }
}

interface City {
    name: string,
    lat: number,
    lng: number,
}