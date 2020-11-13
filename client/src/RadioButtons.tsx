import React from 'react';
import styled from 'styled-components'
import { Checkbox } from './atoms/Checkbox';
import colors from './colors'
import CSS from 'csstype'

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`

const Half = styled.div`
    display: flex;
    flex: 1;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`

const Label = styled.p`
    margin-right: 10px;
    flex: 1;
    color: ${colors.text.onSurface};
    text-align: start;
`

interface RadioButtonsProps {
    labels: string[],
    onChange: (checkedIndex: number) => void,
    checkedIndex: number,
    style?: CSS.Properties,
}

export const RadioButtons = ({ labels, onChange, checkedIndex, style }: RadioButtonsProps) => {
    return (
        <Row style={style}>
            {labels.map((label: string, index: number) => {
                const updateCheckedIndexIfChecked = (isChecked: boolean) => {
                    if (isChecked) {
                        onChange(index)
                    }
                }

                return (
                    <Half>
                        <Label>{label}</Label>
                        <Checkbox 
                            onChange={updateCheckedIndexIfChecked} 
                            isChecked={index === checkedIndex} 
                            style={{flex: 1}} />
                    </Half>
                )
            })}
        </Row>
    );
};
