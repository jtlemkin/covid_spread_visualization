import colors from '../colors'

const numColors = colors.scale.length

function labelValueForIndex(index: number, percentile: number) {
    return ((index - 1) / (numColors - 1) * percentile)
}

function label(index: number, max: number, percentile: number) {
    // Here we make the assumption that if the max number we are looking at is less
    // than one that we are actually viewing percentages
    if (max <= 1) {
        if (index === 0) {
            return '0%'
        } else {
            return `> ${(labelValueForIndex(index, percentile) * 100).toPrecision(2)}%`
        }
    } else {
        if (index === 0) {
            return 0
        } else if (index < numColors) {
            return `> ${labelValueForIndex(index, percentile).toPrecision(2)}`
        }
    }
}

export default label