import { CountyData, Timeline, Snapshot } from '../interfaces'
import PlaceFactory from '../helpers/PlaceFactory'

function getDelta(timeline: Timeline<number>, index: number, fips: number) {
    const num: number | null | undefined = timeline.snapshots[index].statistics[fips.toString()]!

    if (num === null || num === undefined) {
        return null
    }

    if (index % 2 === 0) {
        return null
    } else {
        const lastNum: number | null | undefined = timeline.snapshots[index - 1].statistics[fips.toString()]

        if (lastNum !== undefined && lastNum !== null) {
            return num - lastNum
        } else {
            return num
        }
    }
}

function getPercentage(timeline: Timeline<number>, index: number, fips: number) {
    const num: number | null = timeline.snapshots[index].statistics[fips.toString()]

    if (num === null || num === undefined) {
        return null
    } else {
        const population = PlaceFactory(fips).getPopulation()
        return num / population
    }
}

function timelineMap(
    timeline: Timeline<number>, 
    newValueFun: (timeline: Timeline<number>, index: number, fips: number) => number | null
) {
    const snapshots: Snapshot[] = []
    let max = 0

    timeline.snapshots.forEach((snapshot, index) => {
        const newStatistics: any = {}

        Object.keys(snapshot.statistics).forEach(fipsString => {
            const fips = parseInt(fipsString)
            const newValue = newValueFun(timeline, index, fips)
            newStatistics[fips] = newValue

            if (newValue !== null && newValue > max) {
                max = newValue
            }
        })

        snapshots.push({ timestamp: snapshot.timestamp, statistics: newStatistics })
    })

    return { snapshots, max } as Timeline<number>
}

function extractValue(snapshot: Snapshot, isDataCases: boolean) {
    const newStatistics: any = {}

    Object.entries(snapshot.statistics).forEach(keyValue => {
        const fips = keyValue[0]
        const countyData = keyValue[1] as CountyData
        const value = isDataCases ? countyData.numInfected : countyData.numDead
        newStatistics[fips] = value
    })

    return { timestamp: snapshot.timestamp, statistics: newStatistics } as Snapshot
}

function halve(timeline: Timeline<number>) {
    const newSnapshots = timeline.snapshots
        .filter((snapshot, index) => index % 2 !== 0)
    return { snapshots: newSnapshots, max: timeline.max } as Timeline<number>
}

export default function formatTimeline(
    timeline: Timeline<CountyData>, 
    isDataTotal: boolean, 
    isDataCases: boolean
) {
    // Initialize mapping data
    const snapshots = timeline.snapshots.map(snapshot => extractValue(snapshot, isDataCases))
    const max = isDataCases ? timeline.max.numInfected : timeline.max.numDead
    let newMappingData: Timeline<number> = { snapshots, max }

    if (!isDataTotal) {
        newMappingData = timelineMap(newMappingData, getDelta)
    }

    newMappingData = halve(newMappingData)

    newMappingData = timelineMap(newMappingData, getPercentage)

    return newMappingData
}