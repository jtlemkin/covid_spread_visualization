import colors from '../colors'
import * as d3 from 'd3'

const numColors = colors.scale.length

function labelValueForIndex(index: number, percentile: number) {
    return ((index - 1) / (numColors - 1) * percentile)
}

function label(index: number, max: number, percentile: number) {
    // Here we make the assumption that if the max number we are looking at is less
    // than one that we are actually viewing percentages
    if (max <= 1) { // Percentage
        if (index === 0) {
            return '0%'
        } else {
            return `> ${(labelValueForIndex(index, percentile) * 100).toPrecision(2)}%`
        }
    } else { // Absolute
        if (index === 0) {
            return '0'
        } else if (index < numColors) {
            const formatter = d3.format(".2s")
            const value = formatter(labelValueForIndex(index, percentile))
            return `> ${value}`
        }
    }
}

export default label