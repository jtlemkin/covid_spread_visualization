import React from 'react'
import styled from 'styled-components'
import CSS from 'csstype'

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`

const Icon = styled.svg`
  fill: none;
  stroke: black;
  stroke-width: 2px;
`

interface StyledCheckboxProps {
    readonly checked: boolean,
}

const StyledCheckbox = styled.div<StyledCheckboxProps>`
    display: inline-block;
    width: 16px;
    height: 16px;
    background-color: white;
    border-color: black;
    border-radius: 3px;
    transition: all 150ms;
    ${HiddenCheckbox}:focus + & {
        box-shadow: 0 0 0 3px black;
    };
    ${Icon} {
        visibility: ${props => props.checked ? 'visible' : 'hidden'}
    };
`

const CheckboxContainer = styled.label`
    display: inline-block;
    vertical-align: middle;
`

interface CheckboxProps {
    isChecked: boolean,
    onChange: (isChecked: boolean) => void,
    style?: CSS.Properties
}

export const Checkbox = ({ isChecked, onChange, style }: CheckboxProps) => {
    const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked)
    }

    return (
        <CheckboxContainer style={style}>
            <HiddenCheckbox checked={isChecked} onChange={_onChange} />
            <StyledCheckbox checked={isChecked} >
                <Icon viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                </Icon>
            </StyledCheckbox>
        </CheckboxContainer>
    )
}