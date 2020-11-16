import React, { useState, useCallback } from 'react';
import { getRenderer } from './helpers/mapRenderer'
import CSS from 'csstype'
import { Slider } from './atoms/Slider'
import { Legend } from './Legend'
import { Timeline, LabelledColor, City } from './interfaces'
import colors from './colors'
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PlaceFactory from './helpers/PlaceFactory'
import getPlace from './helpers/getPlace'
import getCanvasPoint from './helpers/getCanvasPoint'
import { Canvas } from './Canvas'
import getScaleLabel from './helpers/getScaleLabel'
import useFetch from './hooks/useFetch';
import { useDashboardState, useDashboardDispatch } from './DashboardContext'

// A fips number is an identifier for counties, states, and the nation

interface USMapProps {
    countyData: Timeline<number>,
    percentile: number,
    style?: CSS.Properties,
}

export const USMap = React.memo(({ countyData, percentile, style }: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    const state = useDashboardState()
    const dispatch = useDashboardDispatch()
    
    const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(countyData.snapshots.length - 1)
    const [cities, setCities] = useState<City[]>([])
    const [highlightedFips, setHighlightedFips] = useState<number | null>(null)

    useFetch(`/cities/${state.currentFips}`, (result: any) => {
        const parsed: City[] = result.map((a: any) => {
            return {
                name: a[0].split(',')[0],
                lat: a[2],
                lng: a[3],
                county_fips: a[1]
            } as City
        })
        
        setCities(parsed);
    })

    const renderer = useCallback(getRenderer(
        state.currentFips, 
        state.previousFips, 
        countyData.snapshots[selectedSnapshotIndex!], 
        percentile,
        cities,
        highlightedFips
    ), [
        state.currentFips, 
        state.previousFips, 
        selectedSnapshotIndex, 
        percentile, 
        cities, 
        state.viewingParams.predictionType, 
        highlightedFips
    ])

    // The map is animated whenever the current fips is different than the previous fips
    // We want to update the current and previous fips to be the same so that the transition
    // animation does not play
    const onSliderChange = (newSnapshotIndex: number | number[] | undefined | null) => {
        setSelectedSnapshotIndex(newSnapshotIndex as number)
    }

    const labelForIndex = (index: number) => {
        const timestamp = countyData!.snapshots[index].timestamp
        const date = new Date(timestamp)
        return date.toLocaleDateString()
    }

    const setPressedFips = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(state.currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, state.currentFips)

        const selectedFips = getPlace(pos, state.currentFips, childType)

        if (selectedFips !== null) {
            dispatch({type: 'set_fips', payload: selectedFips})
        }
    }, [state.currentFips])

    const onHover = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(state.currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, state.currentFips)

        const selectedFips = getPlace(pos, state.currentFips, childType)

        setHighlightedFips(selectedFips)
    }, [state.currentFips])

    let legendLabelledColors = colors.scale.map((color, i) => {
        const label = getScaleLabel(i, countyData.max, percentile)
        return { color, label } as LabelledColor
    })
    const no_data_color = colors.no_data
    const no_data_label = "No Data"
    legendLabelledColors.unshift({ color: no_data_color, label: no_data_label })

    const title = () => {
        const descriptor = state.viewingParams.predictionType === "cases" ? "Reported" : "Predicted"
        const place = PlaceFactory(state.currentFips).name.toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ')
        const daily = state.viewingParams.isTotal ? '' : 'Daily'
        const unit = state.viewingParams.isRelative ? 'Rates' : 'Numbers'
        const death = state.viewingParams.isCases ? '' : 'Death'
    
        return `${descriptor} ${daily} ${place} COVID-19 ${death} ${unit}`
    }
 
    return (
        <div style={style}>
            <h2 style={{ color: colors.text.onBackground, marginBottom: 5, marginTop: 5 }}>{title}</h2>
            <Legend labelledColors={legendLabelledColors} />
            <div style={{position: 'relative'}}>
                <Canvas 
                    width={width} 
                    height={height} 
                    renderFunc={renderer}
                    onPress={setPressedFips} 
                    onHover={onHover}
                    isAnimated={state.shouldAnimate && state.currentFips !== state.previousFips}
                    style={{width: `${width}px`, maxWidth: '100%'}}/>
                { PlaceFactory(state.currentFips).type !== 'nation' && 
                    <FontAwesomeIcon 
                        style={{position: 'absolute', top: '10px', right: '10px', height: '20px', width: '20px', cursor: 'pointer'}}
                        onClick={() => { 
                            dispatch({
                                type: 'set_fips', 
                                payload: PlaceFactory(state.currentFips)
                                    .getOwner()!
                                    .fips
                            }) 
                        }} 
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
