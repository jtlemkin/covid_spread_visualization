import React, { useState } from 'react';
import useCanvas from './hooks/useCanvas'
import { getRenderer } from './helpers/mapRenderer'
import CSS from 'csstype'
import { Slider } from './atoms/Slider'
import { Scale } from './Scale'
import moment from 'moment'
import { Timeline } from './interfaces'
import colors from './colors'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    currentFips: number,
    previousFips: number,
    countyData: Timeline<number>,
    percentile: number,
    style?: CSS.Properties,
}

export const USMap = React.memo(({ currentFips, previousFips, countyData, percentile, style}: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio
    
    const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(countyData.snapshots.length - 1)

    const canvasRef = useCanvas(
        getRenderer(
            currentFips, 
            previousFips, 
            countyData.snapshots[selectedSnapshotIndex!], 
            countyData.max,
            percentile
        ),
        currentFips !== previousFips
    )

    // The map is animated whenever the current fips is different than the previous fips
    // We want to update the current and previous fips to be the same so that the transition
    // animation does not play
    const onSliderChange = (newSnapshotIndex: number | number[] | undefined | null) => {
        setSelectedSnapshotIndex(newSnapshotIndex as number)
    }

    const labelForIndex = (index: number) => {
        return moment(countyData!.snapshots[index].timestamp).format('ll')
    }

    return (
        <div style={style}>
            <h2 style={{ color: colors.text.onBackground }}> US Covid-19 Infection Rates</h2>
            <div style={{position: 'relative'}}>
                <canvas 
                    ref={canvasRef} 
                    width={width} 
                    height={height} 
                    style={{width, maxWidth: '100%'}}>
                </canvas>
                <Scale 
                    style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                    max={countyData.max}
                    percentile={percentile} />
            </div>
            <Slider 
                min={0} 
                max={countyData.snapshots.length - 1}
                defaultValue={countyData.snapshots.length - 1}
                onChange={onSliderChange}
                label={labelForIndex} />
        </div>
    )
})
