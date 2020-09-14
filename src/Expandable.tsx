import React, { FunctionComponent, ReactNode } from 'react'
import { useSpring, animated } from 'react-spring'
import styled from 'styled-components'

const NoOverflow = styled(animated.div)`
    overflow: hidden;
`

interface ExpandableProps {
    isExpanded: boolean,
    isAnimated: boolean,
    height: number,
    children: ReactNode
}

export const Expandable: FunctionComponent<ExpandableProps> = (props) => {
    const { isExpanded, isAnimated, height, children } = props

    const animationConfig = isExpanded ? ({
        height, from: { height: 0 }
    }) : ({
        height: 0, from: { height }
    })
    const animated = useSpring(animationConfig)

    const displayHeight = isAnimated ? (
        animated.height
    ) : (
        isExpanded ? height: 0
    )

    return <NoOverflow style={{height: displayHeight}}>{children}</NoOverflow>
}