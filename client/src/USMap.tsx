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

const Tooltip = styled.div`
    z-index: 100; 
    position: fixed;
    pointer-events: none;
    transform: translate(-50%, -50%);
    background-color: ${colors.background};
    border: 1px grey solid;
    border-radius: 5px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    padding: 5px;
    text-align: left;
`

const TooltipHeader = styled.p`
    font-weight: 500;
`

const Text = styled.p`
    font-size: 0.8em;
    text-align: left;
`

export const USMap = React.memo(({ countyData, percentile, style }: USMapProps) => {
    const width = 975 * window.devicePixelRatio
    const height = 610 * window.devicePixelRatio

    const dashboardState = useDashboardState()
    const dashboardDispatch = useDashboardDispatch()
    const usMapState = useUSMapState()
    const usMapDispatch = useUSMapDispatch()
    const [highlightedFips, setHighlightedFips] = useState<number | null>(null)

    const [tooltipPos, setTooltipPos] = useState<[number, number] | null>(null)

    const lastSnapshotIndex = countyData.snapshots.length - 1

    let tooltipValue: number | null = null
    if (tooltipPos && highlightedFips) {
        if (PlaceFactory(highlightedFips!).type === "county") {
            tooltipValue = countyData
                .snapshots[lastSnapshotIndex - usMapState.snapshotIndexOffset]
                .statistics[highlightedFips!.toString()] as number * 100000
        } else {
            tooltipValue = Object.keys(
                countyData
                    .snapshots[lastSnapshotIndex - usMapState.snapshotIndexOffset]
                    .statistics
            ).reduce((sum, id) => {
                const fips = parseInt(id)
                if (PlaceFactory(highlightedFips!).contains(fips)) {
                    const cases = countyData
                        .snapshots[lastSnapshotIndex - usMapState.snapshotIndexOffset]
                        .statistics[id] as number * PlaceFactory(fips).getPopulation()
                    return sum + cases
                } else {
                    return sum
                }
            }, 0) / PlaceFactory(highlightedFips!).getPopulation() * 100000
        }
    }

    let tooltipName: string | null = null
    if (tooltipPos && highlightedFips) {
        if (PlaceFactory(highlightedFips).type === "county") {
            const pieces = PlaceFactory(highlightedFips).name.split(' ').slice()
            tooltipName = pieces.slice(0, pieces.length - 2).join(' ')
            if (highlightedFips === 1) {
                tooltipName = "New York City"
            }
        } else {
            tooltipName = PlaceFactory(highlightedFips).name
        }
    }

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

        let selectedFips = getPlace(pos, dashboardState.currentFips, childType)

        const newYorkCityFips = [36061, 36047, 36081, 36005, 36085]
        if (selectedFips && newYorkCityFips.includes(selectedFips)) {
            selectedFips = 1
        }

        if (selectedFips !== null) {
            setHighlightedFips(null)
            dashboardDispatch({type: 'set_fips', payload: selectedFips})
        }
    }, [dashboardState.currentFips, dashboardDispatch])

    const onHover = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const type = PlaceFactory(dashboardState.currentFips).type
        const childType = type === "state" ? "county" : "state"
        const pos = getCanvasPoint(event, dashboardState.currentFips)
        setTooltipPos([event.pageX, event.pageY]);

        let selectedFips = getPlace(pos, dashboardState.currentFips, childType)
        const newYorkCityFips = [36061, 36047, 36081, 36005, 36085]
        if (selectedFips && newYorkCityFips.includes(selectedFips)) {
            selectedFips = 1
        }

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
        const descriptor = dashboardState.viewingParams.predictionType === "cases" ? "" : "Predicted"
        const place = PlaceFactory(dashboardState.currentFips).name.toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ')
        const daily = dashboardState.viewingParams.isTotal ? '' : 'Daily'
        const death = dashboardState.viewingParams.isCases ? 'Infections' : 'Deaths'
    
        return `${descriptor} ${daily} ${place} ${death} per 100,000`
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
                { highlightedFips && tooltipPos &&
                    <Tooltip style={{left: tooltipPos[0], top: tooltipPos[1] + 70}}>
                        <TooltipHeader><b>{tooltipName}</b></TooltipHeader>
                        <p style={{fontSize: '0.8em'}}><b>Pop:</b> {PlaceFactory(highlightedFips).getPopulation().toLocaleString()}</p>
                        <p style={{fontSize: '0.8em'}}><b>Per 100,000:</b> {tooltipValue!.toLocaleString("en", {maximumFractionDigits: 0})}</p>
                    </Tooltip> 
                }
            </div>
            <Slider 
                min={0} 
                max={countyData.snapshots.length - 1}
                value={lastSnapshotIndex - usMapState.snapshotIndexOffset}
                onChange={onSliderChange}
                label={labelForIndex} />
            <Text>Developed by James Lemkin, Sreenitha Kasarapu, Sai Manoj, Houman Homayoun</Text>
        </div>
    )
})
