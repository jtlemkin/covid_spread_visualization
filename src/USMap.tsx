import React from 'react';
import useCanvas from './hooks/useCanvas'
import useCovidData from './hooks/useCovidData'
import { getRenderer } from './mapRenderer'
import CSS from 'csstype'
import { Spinner } from './Spinner'
import { Timeline } from './interfaces'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    currentFips: number,
    previousFips: number,
    style?: CSS.Properties
}

export const USMap = ({ currentFips, previousFips, style}: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio
    
    const [countyData, isLoading] = useCovidData()

    const canvasRef = useCanvas(
        getRenderer(
            currentFips, 
            previousFips, 
            countyData?.snapshots[countyData?.snapshots.length - 1], 
            countyData?.highs
        )
    )

    return (
        <div style={style}>
            <canvas ref={canvasRef} width={width} height={height} style={{width, maxWidth: '100%'}}></canvas>
        </div>
    )
}