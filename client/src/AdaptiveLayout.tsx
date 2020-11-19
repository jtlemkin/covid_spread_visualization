import React, { FunctionComponent, ReactNode } from 'react'
import useWindowSize from './hooks/useWindowSize'
import styled from 'styled-components'
import colors from './colors'

type AdaptiveLayoutProps = {
    master: ReactNode,
    detail?: ReactNode,
}

type FixedProps = {
    height: number,
    width: number,
}

const Fixed: FunctionComponent<FixedProps> = ({ height, width, children }) => {
    return (
        <div style={{height, width, maxWidth: width, maxHeight: height, overflow: 'hidden', display: 'flex'}}>
            {children}
        </div>
    )
}

const Header = styled.div`
    width: 100%;
    height: 50px;
    max-height: 50px;
    background-color: ${colors.school};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #DAAA00;
`

const Heading = styled.h2`
    margin: 5px;
    margin-left: 15px;
    color: white;
`

const Text = styled.p`
    color: white;
    margin: 5px;
    margin-right: 15px;
`

interface AppHeaderProps {
    isMobile: boolean
}

const AppHeader = ({isMobile}: AppHeaderProps) => {
    return (
        <Header style={{flexDirection: isMobile ? 'column' : 'row', height: 'auto', maxHeight: 'none'}}>
            <Heading>COVID-19 Prediction Model to Assist in Policy Making</Heading>
            <Text>Developed by Houman Homayoun, Sai Manoj, Sreenitha Kasarapu and James Lemkin</Text>
        </Header>
    )
}

export const AdaptiveLayout = ({ master, detail }: AdaptiveLayoutProps) => {
    const windowSize = useWindowSize()
    const isDesktop = windowSize.width > 1024

    if (!isDesktop) {
        return (
            <div>
                <AppHeader isMobile={true}/>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    {master}
                    {detail}
                </div>
            </div>
        )
    }

    return (
        <div>
            <AppHeader isMobile={false}/>
            <Fixed height={windowSize.height - 50} width={windowSize.width}>
                <div style={{ display: 'flex', flexDirection: 'row', maxHeight: '100%', margin: 'auto' }}>
                    {master}
                </div>

                {detail && 
                    <div style={{ width: '400px', minWidth: '400px', maxHeight: '100%', overflowY: 'scroll' }}>
                        {detail}
                    </div>
                }
            </Fixed>
        </div>
    )
}