import React from 'react';
import styled from 'styled-components'
import { Checkbox } from './atoms/Checkbox';
import colors from './colors'

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`

const Label = styled.p`
    padding-right: 5px;
    padding-left: 5px;
    flex: 1;
    color: ${colors.text.onSurface};
`

interface LabelledSwitchProps {
    label: string,
    onChange: (value: boolean) => void,
    checked: boolean
}

export const LabelledSwitch = ({ label, onChange, checked }: LabelledSwitchProps) => {
    return (
        <Row>
            <Label>{label}</Label>
            <Checkbox onChange={onChange} isChecked={checked} style={{flex: 1}} />
        </Row>
    );
};
