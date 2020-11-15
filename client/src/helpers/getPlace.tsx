import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { Topology } from 'topojson-specification'
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson"
import usUntyped from '../data/counties-albers-10m.json'
import PlaceFactory from './PlaceFactory'

export default function getPlace(
    pos: [number, number],
    currentFips: number, 
    type: string
) {
    const us = (usUntyped as unknown) as Topology
    const places = type === "state" ? (
        topojson.feature(us, (us as any).objects.states) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    ) : (
        topojson.feature(us, (us as any).objects.counties) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    )

    if (pos) {
        for (const feature of places.features) {
            if (PlaceFactory(currentFips).contains(parseInt(feature.id! as string))) {
                for (const polygon of (feature.geometry as any).coordinates as [number, number][][][]) {
                    const vertices = (type === "state" ? polygon[0] : polygon) as unknown as [number, number][]
                    if (d3.polygonContains(vertices, pos)) {
                        let fips = parseInt(feature.id as string)
                        if (type === "state") {
                            fips *= 1000
                        }
                        return fips
                    }
                }
            }
        }
    }
    
    return null
}