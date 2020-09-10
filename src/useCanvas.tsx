import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

const useCanvas = (draw: (context: CanvasRenderingContext2D, t: number) => void) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

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
            const ease = d3.easeQuadIn

            const timer = d3.timer(elapsed => {
                const duration = 1000
                const t = Math.min(1, ease(elapsed / duration))

                draw(context, t)

                if (t === 1) {
                    timer.stop()
                }
            })
        }
    }, [draw])

    return canvasRef
}

export default useCanvas