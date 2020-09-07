import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import { Topology, GeometryObject } from 'topojson-specification'
import usUntyped from './counties-albers-10m.json'

//const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])
const path = d3.geoPath()
const us = (usUntyped as unknown) as Topology
const statesPath = path(topojson.mesh(us, us.objects.states as GeometryObject, (a, b) => a !== b)) ?? ""
const nationPath = path(topojson.feature(us, us.objects.nation as GeometryObject)) ?? ""

const counties = usUntyped.objects.counties.geometries

export const getRenderer = (selectedCountyID: string | null) => {
    return (context: CanvasRenderingContext2D) => {
        counties.forEach((county) => {
            const countyPath = path(topojson.feature(us, county as GeometryObject)) ?? ""
            const countyPath2D = new Path2D(countyPath)
    
            context.lineWidth = 0.5
            context.strokeStyle = "#aaa"
            context.stroke(countyPath2D)
    
            if (selectedCountyID !== null && selectedCountyID === county.id) {
                console.log("change color!")
                context.fillStyle = 'red'
                context.fill()
            }
        })
    
        const statesPath2D = new Path2D(statesPath)
        context.lineWidth = 0.5
        context.strokeStyle = 'black'
        context.stroke(statesPath2D)
    
        const nationPath2D = new Path2D(nationPath)
        context.lineWidth = 1
        context.stroke(nationPath2D)
    }
}