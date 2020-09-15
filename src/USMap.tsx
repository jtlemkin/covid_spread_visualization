import React from 'react';
import useCanvas from './hooks/useCanvas'
import useCovidData from './hooks/useCovidData'
import { getRenderer } from './mapRenderer'
import CSS from 'csstype'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    currentFips: number,
    previousFips: number,
    style?: CSS.Properties
}

const getMostRecentNormalizedRates = (data: Map<number, number[]>) => {
    let newest = new Map<number, number>()
    data.forEach((countyData, fips) => {
        newest.set(fips, countyData[countyData.length - 1])
    })
    return newest
}

export const USMap = ({ currentFips, previousFips, style}: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio
    
    const countyData = useCovidData()
    const mostRecentNormalizedRates = countyData ? getMostRecentNormalizedRates(countyData) : null
    
    const canvasRef = useCanvas(getRenderer(currentFips, previousFips, mostRecentNormalizedRates))

    return (
        <div style={style}>
            <canvas ref={canvasRef} width={width} height={height} style={{width, maxWidth: '100%'}}></canvas>
        </div>
    )
}