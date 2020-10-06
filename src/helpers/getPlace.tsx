import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { Topology } from 'topojson-specification'
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson"
import usUntyped from '../data/us-10m.json'
import React from 'react'

export default function getPlace(
    event: React.PointerEvent<HTMLCanvasElement>, 
    type: string
) {
    const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300])
    const pos = projection.invert!((d3 as any).pointer(event))

    const us = (usUntyped as unknown) as Topology
    const places = type === "state" ? (
        topojson.feature(us, (us as any).objects.states) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    ) : (
        topojson.feature(us, (us as any).objects.counties) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
    )

    if (pos) {
        const place = places.features.find(feature => d3.geoContains(feature, pos))

        if (place) {
            if (type === "state") {
                return place.properties!['STATE_FIPS'] as number * 1000
            } else {
                return place.properties!['ADMIN_FIPS'] as number
            }
        }
    } else {
        return null
    }
}