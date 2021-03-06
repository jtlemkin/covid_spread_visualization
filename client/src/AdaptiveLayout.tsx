import React, { FunctionComponent, ReactNode } from 'react'
import useWindowSize from './hooks/useWindowSize'
import styled from 'styled-components'
import colors from './colors'
import CSS from 'csstype'

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

const headerHeight = 50

const Header = styled.div`
    width: 100%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #DAAA00;
`

const Heading = styled.h2`
    margin-left: 15px;
    color: black;
    font-size: 1.3em;
`

const Img = styled.img`
    padding-left: 20px;
`

interface AppHeaderProps {
    isMobile: boolean,
    style?: CSS.Properties
}

const AppHeader = ({isMobile, style}: AppHeaderProps) => {
    return (
        <Header style={{flexDirection: isMobile ? 'column' : 'row', ...style}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', margin: '10px'}}>
                <Heading>COVID-19 Prediction Model to Assist in Policy Making: Beta Version</Heading>
                <div style={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    <Img src="/NSF_4-Color_bitmap_Logo.png" style={{maxHeight: 40}} />
                    <Img src="/UC-Davis-Logo.png" style={{maxHeight: 25}} />
                    <Img src="/1024px-George_Mason_University_logo.svg.png" style={{maxHeight: 30, paddingBottom: 5}} />
                </div>
            </div>
        </Header>
    )
}

export const AdaptiveLayout = ({ master, detail }: AdaptiveLayoutProps) => {
    const windowSize = useWindowSize()
    const isDesktop = windowSize.width > 1024

    if (!isDesktop) {
        return (
            <div style={{width: '100%'}}>
                <AppHeader isMobile={true} style={{height: 'auto'}}/>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    {master}
                    {detail}
                </div>
            </div>
        )
    }

    return (
        <div>
            <AppHeader isMobile={false} style={{height: `${headerHeight}px`}}/>
            <Fixed height={windowSize.height - headerHeight} width={windowSize.width}>
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%', margin: 'auto' }}>
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