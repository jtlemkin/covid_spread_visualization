import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useDashboardDispatch } from '../DashboardContext'

const useCanvas = (draw: (context: CanvasRenderingContext2D, t: number) => void, shouldAnimate: boolean) => {
    const dispatch = useDashboardDispatch()

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [isAnimating, setIsAnimating] = useState(false)

    // Scale canvas to be retina resolution
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (context) {
            const ratio = window.devicePixelRatio
            context.scale(ratio, ratio)
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (canvas && context) {
            if (!isAnimating) {
                if (shouldAnimate) {
                    setIsAnimating(true)
                    const ease = d3.easeQuadIn
    
                    const timer = d3.timer(elapsed => {
                        const duration = 750
                        const t = Math.min(1, ease(elapsed / duration))
    
                        draw(context, t)
    
                        if (t === 1) {
                            // useCanvas internally keeps track of an isAnimating
                            // state so that rerenders don't interrupt the
                            // first animation. The dispatch is to prevent a 
                            // cascading bug, although I'm not sure what it's
                            // cause is
                            timer.stop()
                            setIsAnimating(false)
                            dispatch({type: 'finish_animating'})
                        }
                    })
                } else {
                    draw(context, 1)
                }
            }
            console.log()
        }
    }, [draw])

    return canvasRef
}

export default useCanvas