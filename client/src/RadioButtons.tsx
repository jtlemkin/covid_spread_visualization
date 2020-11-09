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
    label1: string,
    label2: string,
    onChange: (value: boolean) => void,
    firstChecked: boolean,
    style?: CSS.Properties,
}

export const RadioButtons = ({ label1, label2, onChange, firstChecked, style }: RadioButtonsProps) => {
    return (
        <Row style={style}>
            <Half>
                <Label>{label1}</Label>
                <Checkbox onChange={onChange} isChecked={firstChecked} style={{flex: 1}} />
            </Half>

            <Half>
                <Label>{label2}</Label>
                <Checkbox onChange={onChange} isChecked={!firstChecked} style={{flex: 1}} />
            </Half>
        </Row>
    );
};
