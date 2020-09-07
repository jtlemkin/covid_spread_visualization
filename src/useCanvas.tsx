import { useRef, useEffect } from 'react'

const useCanvas = (draw: (context: CanvasRenderingContext2D) => void) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Scale canvas to be retina resolution
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (context) {
            context.scale(2, 2)
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (canvas && context) {
            context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
            draw(context)
        }
    }, [draw])

    return canvasRef
}

export default useCanvas