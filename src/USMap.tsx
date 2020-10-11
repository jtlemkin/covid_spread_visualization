import React, { useState } from 'react';
import useCanvas from './hooks/useCanvas'
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
import * as d3 from 'd3'

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

    const canvasRef = useCanvas(
        getRenderer(
            currentFips, 
            previousFips, 
            countyData.snapshots[selectedSnapshotIndex!], 
            percentile
        ),
        currentFips !== previousFips
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

    const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = event.currentTarget
        const m = canvas.getContext("2d")!.getTransform()
        const mi = m.inverse()

        const rect = canvas.getBoundingClientRect()

        const pos = new DOMPoint(
            (event.clientX - rect.left) / canvasRef.current!.clientWidth * 975, 
            (event.clientY - rect.top) / canvasRef.current!.clientHeight * 610
        )

        const nationalTransform = PlaceFactory(0).getTransform()
        const nationalMatrix = new DOMMatrix(
            [nationalTransform.scale, 0, 0, nationalTransform.scale, ...nationalTransform.scaleAdjustedTranslation]
        )

        const currentTransform = PlaceFactory(currentFips).getTransform()
        const currentMatrix = (new DOMMatrix(
            [currentTransform.scale, 0, 0, currentTransform.scale, ...currentTransform.scaleAdjustedTranslation]
        ))

        const pointAsMatrix = (new DOMMatrix()).translate(pos.x, pos.y)
        const targetPointHoldingMatrix = nationalMatrix.multiply(currentMatrix.inverse()).multiply(pointAsMatrix)

        console.log("Pp", [pos.x, pos.y])
        console.log("P", [targetPointHoldingMatrix.e, targetPointHoldingMatrix.f])

        return [targetPointHoldingMatrix.e, targetPointHoldingMatrix.f] as [number, number]
    }

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event)

        const selectedFips = getPlace(pos, currentFips, childType)

        if (selectedFips !== null) {
            setFips(selectedFips)
        }
    }
 
    return (
        <div style={style}>
            <h2 style={{ color: colors.text.onBackground }}>{title}</h2>
            <div style={{position: 'relative'}}>
                <canvas 
                    ref={canvasRef} 
                    width={width} 
                    height={height}
                    onPointerDown={onPointerDown} 
                    style={{width, maxWidth: '100%'}}>
                </canvas>
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
