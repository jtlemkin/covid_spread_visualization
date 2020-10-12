import React, { useState, useCallback } from 'react';
import { getRenderer } from './helpers/mapRenderer'
import CSS from 'csstype'
import { Slider } from './atoms/Slider'
import { Scale } from './Scale'
import moment from 'moment'
import { Timeline } from './interfaces'
import colors from './colors'
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PlaceFactory from './helpers/PlaceFactory'
import getPlace from './helpers/getPlace'
import getCanvasPoint from './helpers/getCanvasPoint'
import { Canvas } from './Canvas'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    title: string,
    currentFips: number,
    previousFips: number,
    countyData: Timeline<number>,
    percentile: number,
    setFips: (newFips: number) => void,
    style?: CSS.Properties,
}

export const USMap = React.memo(({ title, currentFips, previousFips, countyData, percentile, setFips, style}: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio
    
    const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(countyData.snapshots.length - 1)

    const renderer = useCallback(getRenderer(
        currentFips, 
        previousFips, 
        countyData.snapshots[selectedSnapshotIndex!], 
        percentile
    ), [currentFips, previousFips, selectedSnapshotIndex, percentile])

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

    const setPressedFips = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, currentFips)

        const selectedFips = getPlace(pos, currentFips, childType)

        if (selectedFips !== null) {
            setFips(selectedFips)
        }
    }, [currentFips])
 
    return (
        <div style={style}>
            <h2 style={{ color: colors.text.onBackground }}>{title}</h2>
            <div style={{position: 'relative'}}>
                <Canvas 
                    width={width} 
                    height={height} 
                    renderFunc={renderer}
                    onPress={setPressedFips} 
                    isAnimated={currentFips != previousFips}
                    style={{width: `${width}px`, maxWidth: '100%'}}/>
                <Scale 
                    style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                    max={countyData.max}
                    percentile={percentile} />
                { PlaceFactory(currentFips).type !== 'nation' && 
                    <FontAwesomeIcon 
                        style={{position: 'absolute', top: '10px', right: '10px', height: '20px', width: '20px', cursor: 'pointer'}}
                        onClick={() => { setFips(PlaceFactory(currentFips).getOwner()!.fips) }} 
                        icon={faSearchMinus}/>
                }
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
