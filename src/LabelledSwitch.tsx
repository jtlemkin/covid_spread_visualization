import React from 'react';
import styled from 'styled-components'
import { Checkbox } from './atoms/Checkbox';

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`

interface LabelledSwitchProps {
    label: string,
    onChange: (value: boolean) => void,
    checked: boolean
}

export const LabelledSwitch = ({ label, onChange, checked }: LabelledSwitchProps) => {
    return (
        <Row>
            <p style={{ paddingRight: '5px', paddingLeft: '5px', flex: 1 }}>{label}</p>
            <Checkbox onChange={onChange} isChecked={checked} style={{flex: 1}} />
        </Row>
    );
};
