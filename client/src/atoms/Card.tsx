import styled from 'styled-components'
import colors from '../colors'

export const Card = styled.div`
    width: 100%;
    padding: 2px 16px;
    margin-bottom: 10px;
    background-color: ${colors.surface};
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border-radius: 5px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
`