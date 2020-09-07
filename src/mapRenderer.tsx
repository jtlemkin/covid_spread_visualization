import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'

//const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

export const getRenderer = (selectedCountyID: string | null) => {
    return (context: CanvasRenderingContext2D) => {
        console.log(usUntyped)

        const path = d3.geoPath(null, context)
        const us = (usUntyped as unknown) as Topology

        context.lineJoin = "round"
        context.lineCap = "round"

        // Draw counties
        context.beginPath()
        path(topojson.mesh(us, us.objects.counties as GeometryObject, (a: any, b: any) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0)))
        context.lineWidth = 0.5;
        context.strokeStyle = "#aaa"
        context.stroke();

        // Fill in selected county
        if (selectedCountyID) {
            context.beginPath()
            const county = usUntyped.objects.counties.geometries.find(county => county.id === selectedCountyID)
            path(topojson.feature(us, county as GeometryObject))
            context.fillStyle = 'red'
            context.fill()
        }
    
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
}