import React from 'react'
import useCanvas from './hooks/useCanvas'
import CSS from 'csstype'

interface CanvasProps {
    height: number,
    width: number,
    renderFunc: (context: CanvasRenderingContext2D, t: number) => void,
    isAnimated: boolean,
    onPress: (event: React.PointerEvent<HTMLCanvasElement>) => void,
    onHover: (event: React.PointerEvent<HTMLCanvasElement>) => void,
    onLeave: () => void,
    style: CSS.Properties
}

export const Canvas = ({ 
    height, 
    width, 
    renderFunc, 
    isAnimated,
    onPress, 
    onHover,
    onLeave
}: CanvasProps) => {
    const canvasRef = useCanvas(
        renderFunc,
        isAnimated
    )

    console.log("canvas rerender!")

    return (
        <canvas 
            ref={canvasRef} 
            width={width} 
            height={height}
            onPointerDown={onPress} 
            onPointerMove={onHover}
            onPointerLeave={onLeave}
            style={{width: `${width}px`, maxWidth: '100%'}}> </canvas>
    )
}