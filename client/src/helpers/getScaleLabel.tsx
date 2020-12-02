import colors from '../colors'
import * as d3 from 'd3'

const numColors = colors.scale.length

function labelValueForIndex(index: number, percentile: number) {
    return index * percentile / numColors
}

function label(index: number, max: number, percentile: number) {
    // Here we make the assumption that if the max <= 1 then we are viewing percentages
    if (max <= 1) { // Percentage
        //return `> ${(labelValueForIndex(index, percentile) * 100).toPrecision(2)}%`
        let value = labelValueForIndex(index, percentile) * 100000
        if (value >= 1) {
            value = Math.floor(value)
        }
        return `> ${value.toLocaleString()}`
    } else { // Absolute
        if (index === 0) {
            return '>= 0'
        } else if (index < numColors) {
            const formatter = d3.format(".2s")
            const value = formatter(labelValueForIndex(index, percentile))
            return `> ${value}`
        }
    }
}

export default label