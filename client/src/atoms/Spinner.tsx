import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const Spinner = () => {
    const [spinAgain, setSpinAgain] = useState(false)

    const rotation = useSpring({
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(240deg)"},
        onRest: () => setSpinAgain(!spinAgain),
        reset: spinAgain,
    })

    return (
        <animated.div style={rotation} >
            <FontAwesomeIcon icon={faSpinner} size="5x"/>
        </animated.div>
    )
}