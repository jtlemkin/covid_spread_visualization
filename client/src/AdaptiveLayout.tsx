import React, { FunctionComponent, ReactNode } from 'react'
import useWindowSize from './hooks/useWindowSize'

type AdaptiveLayoutProps = {
    master: ReactNode,
    detail: ReactNode,
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

export const AdaptiveLayout = ({ master, detail }: AdaptiveLayoutProps) => {
    const windowSize = useWindowSize()
    const isDesktop = windowSize.width > 1024

    if (!isDesktop) {
        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {master}
                {detail}
            </div>
        )
    }

    return (
        <Fixed height={windowSize.height} width={windowSize.width}>
            <div style={{ display: 'flex', flexDirection: 'row', maxHeight: '100%', margin: '0 auto' }}>
                {master}
            </div>

            <div style={{ width: '400px', minWidth: '400px', maxHeight: '100%', overflowY: 'scroll' }}>
                {detail}
            </div>
        </Fixed>
    )
}