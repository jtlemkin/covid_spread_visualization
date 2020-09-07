import { useRef, useEffect } from 'react'

const useCanvas = (draw: (context: CanvasRenderingContext2D) => void) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
        const parent = canvas.parentElement as HTMLDivElement

        if (parent) {
            const { width, height } = parent.getBoundingClientRect() 
            canvas.width = width
            canvas.height = height

            console.log("Bounding", parent.getBoundingClientRect())
            console.log("canvas", {width: canvas.width, height: canvas.height})
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (canvas && context) {
            resizeCanvasToDisplaySize(canvas)
            draw(context)
        }
    }, [draw])

    return canvasRef
}

export default useCanvas