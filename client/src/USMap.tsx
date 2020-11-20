import React, { useState, useCallback, useMemo } from 'react';
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
import { useUSMapState, useUSMapDispatch } from './USMapContext';
import styled from 'styled-components'

interface USMapProps {
    countyData: Timeline<number>,
    percentile: number,
    style?: CSS.Properties,
}

const Icon = styled(FontAwesomeIcon)`
    position: absolute;
    top: 10px; 
    right: 10px;
    height: 20px; 
    width: 20px !important; 
    cursor: pointer
`

export const USMap = React.memo(({ countyData, percentile, style }: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    const dashboardState = useDashboardState()
    const dashboardDispatch = useDashboardDispatch()
    const usMapState = useUSMapState()
    const usMapDispatch = useUSMapDispatch()
    const [highlightedFips, setHighlightedFips] = useState<number | null>(null)

    const lastSnapshotIndex = countyData.snapshots.length - 1

    const [unparsedCities, isFetching] = useFetch<any>(`/cities/${dashboardState.currentFips}`, true)
    const cities = useMemo(() => {
        if (isFetching) {
            return []
        }

        return unparsedCities.map((a: any) => {
            return {
                name: a[0].split(',')[0],
                lat: a[2],
                lng: a[3],
                county_fips: a[1]
            } as City
        }) as City[]
    }, [unparsedCities, isFetching])

    const renderer = useCallback(getRenderer(
        dashboardState.currentFips, 
        dashboardState.previousFips, 
        countyData.snapshots[lastSnapshotIndex - usMapState.snapshotIndexOffset], 
        percentile,
        cities,
        highlightedFips
    ), [
        dashboardState.currentFips, 
        dashboardState.previousFips, 
        usMapState.snapshotIndexOffset, 
        percentile, 
        cities, 
        dashboardState.viewingParams.predictionType, 
        highlightedFips,
        dashboardDispatch
    ])

    // The map is animated whenever the current fips is different than the previous fips
    // We want to update the current and previous fips to be the same so that the transition
    // animation does not play
    const onSliderChange = (newSnapshotIndex: number | number[] | undefined | null) => {
        const payload = lastSnapshotIndex - (newSnapshotIndex as number)
        usMapDispatch({type: 'set_snapshot', payload})
    }

    const labelForIndex = (index: number) => {
        const timestamp = countyData!.snapshots[index].timestamp
        const date = new Date(timestamp)
        return date.toLocaleDateString()
    }

    const setPressedFips = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(dashboardState.currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, dashboardState.currentFips)

        const selectedFips = getPlace(pos, dashboardState.currentFips, childType)

        if (selectedFips !== null) {
            setHighlightedFips(null)
            dashboardDispatch({type: 'set_fips', payload: selectedFips})
        }
    }, [dashboardState.currentFips, dashboardDispatch])

    const onHover = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(dashboardState.currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, dashboardState.currentFips)

        const selectedFips = getPlace(pos, dashboardState.currentFips, childType)

        setHighlightedFips(selectedFips)
    }, [dashboardState.currentFips])

    const onLeave = useCallback(() => {
        setHighlightedFips(null)
    }, [])

    let legendLabelledColors = colors.scale.map((color, i) => {
        const label = getScaleLabel(i, countyData.max, percentile)
        return { color, label } as LabelledColor
    })
    const no_data_color = colors.no_data
    const no_data_label = "N/A"
    legendLabelledColors.unshift({ color: no_data_color, label: no_data_label })

    const title = () => {
        const descriptor = dashboardState.viewingParams.predictionType === "cases" ? "Reported" : "Predicted"
        const place = PlaceFactory(dashboardState.currentFips).name.toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ')
        const daily = dashboardState.viewingParams.isTotal ? '' : 'Daily'
        const death = dashboardState.viewingParams.isCases ? 'Infection' : 'Deaths'
        const dateFormattingOptions = {day: "2-digit", month: "short"}
        const lastUpdated = new Date(countyData.snapshots[countyData.snapshots.length - 1].timestamp)
        const lastUpdateLabel = lastUpdated.toLocaleDateString(undefined, dateFormattingOptions)
    
        return `${descriptor} ${daily} ${place} ${death} Rates\nUpdated ${lastUpdateLabel}`
    }
 
    return (
        <div style={style}>
            <h2 style={{ color: colors.text.onBackground, marginBottom: 5, marginTop: 5 }}>{title()}</h2>
            <Legend labelledColors={legendLabelledColors} />
            <div style={{position: 'relative'}}>
                <Canvas 
                    width={width} 
                    height={height} 
                    renderFunc={renderer}
                    onPress={setPressedFips} 
                    onHover={onHover}
                    onLeave={onLeave}
                    isAnimated={dashboardState.shouldAnimate && dashboardState.currentFips !== dashboardState.previousFips}
                    style={{width: `${width}px`, maxWidth: '100%'}}/>
                { PlaceFactory(dashboardState.currentFips).type !== 'nation' && 
                    <Icon 
                        onClick={() => { 
                            setHighlightedFips(null)
                            dashboardDispatch({
                                type: 'set_fips', 
                                payload: PlaceFactory(dashboardState.currentFips)
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
                value={lastSnapshotIndex - usMapState.snapshotIndexOffset}
                onChange={onSliderChange}
                label={labelForIndex} />
        </div>
    )
})
