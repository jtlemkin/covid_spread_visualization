import React from 'react';
import styled from 'styled-components'
import { Checkbox } from './atoms/Checkbox';
import colors from './colors'
import CSS from 'csstype'

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
`

const Half = styled.div`
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin: 10px;
    max-width: 50%;
`

const Label = styled.p`
    flex: 1;
    color: ${colors.text.onSurface};
    text-align: start;
    margin-left: 5px;
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
                        <Checkbox 
                            onChange={updateCheckedIndexIfChecked} 
                            isChecked={index === checkedIndex} />
                        <Label>{label}</Label>
                    </Half>
                )
            })}
        </Row>
    );
};
