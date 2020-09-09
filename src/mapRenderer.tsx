import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'
import cities from './cities.json'

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

function drawMap(context: CanvasRenderingContext2D, transform: TransformParams | null = null) {
    const path = d3.geoPath(null, context)
    const us = (usUntyped as unknown) as Topology

    context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight)

    if (transform) {
        console.log("Transform!")
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f)
    }

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

function getCountyHeight(selectedCountyID: string) {
    const path = d3.geoPath()
    const us = (usUntyped as unknown) as Topology
    const county = usUntyped.objects.counties.geometries.find(county => county.id === selectedCountyID)
    const bounds = path.bounds(topojson.feature(us, county as GeometryObject))
    return bounds[1][1] - bounds[0][1]
}

function getCenterForCounty(selectedCountyID: string) {
    const path = d3.geoPath()
    const us = (usUntyped as unknown) as Topology
    const county = usUntyped.objects.counties.geometries.find(county => county.id === selectedCountyID)
    return path.centroid(topojson.feature(us, county as GeometryObject))
}

export const getRenderer = (selectedCountyID: string | null) => {
    return (context: CanvasRenderingContext2D, t: number, t0: number | null = null) => {
        context.lineJoin = "round"
        context.lineCap = "round"

        if (selectedCountyID) {
            const oldCenter = [487.5, 305]
            const newCenter = getCenterForCounty(selectedCountyID)
            const maxTranslation = [oldCenter[0] - newCenter[0], oldCenter[1] - newCenter[1]]
            const translations = d3.interpolate([0, 0], maxTranslation)

            const oldHeight = 610
            const newHeight = getCountyHeight(selectedCountyID)
            const maxScale = oldHeight / newHeight
            const scales = d3.interpolate(1, maxScale)
            const scaleShifts = d3.interpolate([0, 0], oldCenter)

            const s = !t0 ? scales(t) : scales(t) - scales(t0)
            const tx = !t0 ? translations(t)[0] : translations(t)[0] - translations(t0)[0]
            const ty = !t0 ? translations(t)[1] : translations(t)[1] - translations(t0)[1]
            const cx = !t0 ? scaleShifts(t)[0] : scaleShifts(t)[0] - scaleShifts(t0)[0]
            const cy = !t0 ? scaleShifts(t)[1] : scaleShifts(t)[1] - scaleShifts(t0)[1]
            //const cx = context.canvas.width / 2
            //const cy = context.canvas.height / 2

            console.log("MAXSCALE", maxScale)
            console.log("Scale", s)
            console.log("TRANSL", tx, ty)
            console.log("CTRANSL", -cx, -cy)

            const transformParams: TransformParams = {
                a: s,
                b: 0,
                c: 0,
                d: s,
                e: tx - cx,
                f: ty - cy,
            }

            //console.log(transformParams)

            /*const scales = d3.interpolate(1, maxScale)
            const scale = t0 !== null ? (
                scales(t) / scales(t0)
            ) : (
                scales(t)
            )
            const scaleVector2D = {x: scale, y: scale}
            console.log("SCALE", scale)*/

            drawMap(context, transformParams)
        }

        drawMap(context)
        drawCapitalLabels(context)
    }
}

interface City {
    name: string,
    lat: number,
    lng: number,
}

interface Vector2D {
    x: number,
    y: number
}

interface Transition {
    start: number,
    end: number
}

interface TransformParams {
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
}