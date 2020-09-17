import React, { useState, useEffect } from 'react';
import useCanvas from './hooks/useCanvas'
import useCovidData from './hooks/useCovidData'
import { getRenderer } from './mapRenderer'
import CSS from 'csstype'
import { Spinner } from './Spinner'
import { Slider } from './Slider'
import moment from 'moment'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    currentFips: number,
    previousFips: number,
    setFips: (newFips: number) => void
    style?: CSS.Properties
}

export const USMap = ({ currentFips, previousFips, setFips, style}: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio
    
    const [countyData, isLoading] = useCovidData()
    const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number | null>(null)

    useEffect(() => {
        if (countyData) {
            setSelectedSnapshotIndex(countyData.snapshots.length - 1)
        }
    }, [countyData])

    const canvasRef = useCanvas(
        getRenderer(
            currentFips, 
            previousFips, 
            countyData?.snapshots[selectedSnapshotIndex!], 
            countyData?.highs
        ),
        countyData !== null
    )

    // The map is animated whenever the current fips is different than the previous fips
    // We want to update the current and previous fips to be the same so that the transition
    // animation does not play
    const onSliderChange = (newSnapshotIndex: number | number[] | undefined | null) => {
        setSelectedSnapshotIndex(newSnapshotIndex as number)
        setFips(currentFips)
    }

    const labelForIndex = (index: number) => {
        return moment(countyData!.snapshots[index].timestamp).format('ll')
    }

    if (!countyData) {
        return (
            <div style={style}>
                <Spinner />
            </div>
        )
    }

    return (
        <div style={style}>
            <canvas 
                ref={canvasRef} 
                width={width} 
                height={height} 
                style={{width, maxWidth: '100%'}}>
            </canvas>
            <Slider 
                min={0} 
                max={countyData.snapshots.length - 1}
                defaultValue={countyData.snapshots.length - 1}
                onChange={onSliderChange}
                label={labelForIndex} />
        </div>
    )
}