import React from 'react'
import ReactSlider from 'react-slider'
import styled from 'styled-components'
import colors from '../colors'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 42px;
`

const StyledThumb = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: row;
    font-color: white;
    height: 42px;
    border-radius: 20px;
    background-color: #DAAA00;
    justify-content: center;
    cursor: grab;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
`

const StyledTrack = styled.div`
    height: 2px;
    background: black;
    top: 21px;
    background-color: ${colors.text.onBackground};
`

const Label = styled.div`
    font-size: 1em;
    margin-left: 5px;
    margin-right: 5px;
`

interface SliderProps {
    min: number,
    max: number,
    value: number,
    onChange: (value: number | number[] | null | undefined) => void,
    label: (value: number) => string
}

export const Slider = (props: SliderProps) => {
    const { min, max, value, onChange, label } = props

    const Thumb = (props: object, state: ThumbState) => {
        return (
            <StyledThumb {...props}>
                <FontAwesomeIcon icon={faChevronLeft} style={{paddingLeft: '5px'}}/>
                <Label><b>{label(value)}</b></Label>
                <FontAwesomeIcon icon={faChevronRight}style={{paddingRight: '5px'}}/>
            </StyledThumb>
        )
    }

    const Track = (props: object, state: TrackState) => {
        return <StyledTrack {...props}></StyledTrack>
    }

    return (
        <StyledSlider
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            orientation='horizontal'
            renderThumb={Thumb}
            renderTrack={Track}/>
    )
}

interface ThumbState {
    index: number,
    value: number | number[],
    valueNow: number
}

interface TrackState {
    index: number,
    value: number | number[]
}