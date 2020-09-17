import React from 'react'
import ReactSlider from 'react-slider'
import styled from 'styled-components'

const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 42px;
    margin-top: 25px;
    margin-bottom: 25px;
`

const StyledThumb = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    height: 42px;
`

const Bar = styled.div`
    height: 30px;
    width: 3px;
    cursor: grab;
    background-color: black;
`

const StyledTrack = styled.div`
    height: 2px;
    background: black;
    top: 14px;
`

const Label = styled.div`
    font-size: 1em;
`

interface SliderProps {
    min: number,
    max: number,
    defaultValue: number,
    onChange: (value: number | number[] | null | undefined) => void,
    label: (value: number) => string
}

export const Slider = (props: SliderProps) => {
    const { min, max, defaultValue, onChange, label } = props

    const Thumb = (props: object, state: ThumbState) => {
        return (
            <StyledThumb {...props}>
                <Bar />
                <Label>
                    {label(state.value as number)}
                </Label>
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
            defaultValue={defaultValue}
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