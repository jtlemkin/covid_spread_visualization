import getTransform from './getTransform'

const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>, currentFips: number) => {
    const canvas = event.currentTarget

    const rect = canvas.getBoundingClientRect()

    const pos = new DOMPoint(
        (event.clientX - rect.left) / canvas.clientWidth * 975, 
        (event.clientY - rect.top) / canvas.clientHeight * 610
    )

    const nationalTransform = getTransform(0)
    const nationalMatrix = new DOMMatrix(
        [nationalTransform.scale, 0, 0, nationalTransform.scale, ...nationalTransform.scaleAdjustedTranslation]
    )

    const currentTransform = getTransform(currentFips)
    const currentMatrix = (new DOMMatrix(
        [currentTransform.scale, 0, 0, currentTransform.scale, ...currentTransform.scaleAdjustedTranslation]
    ))

    const pointAsMatrix = (new DOMMatrix()).translate(pos.x, pos.y)
    const targetPointHoldingMatrix = nationalMatrix.multiply(currentMatrix.inverse()).multiply(pointAsMatrix)

    return [targetPointHoldingMatrix.e, targetPointHoldingMatrix.f] as [number, number]
}

export default getCanvasPoint