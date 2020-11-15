import { CountyData, Timeline, Snapshot } from '../interfaces'
import PlaceFactory from '../helpers/PlaceFactory'

function getDelta(timeline: Timeline<number>, index: number, fips: number) {
    const num: number | null | undefined = timeline.snapshots[index].statistics[fips.toString()]!

    if (num === null || num === undefined) {
        return null
    }

    if (index === 0) {
        return num
    } else {
        const lastNum: number | null  | undefined = timeline.snapshots[index - 1].statistics[fips.toString()]

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
        if (Number.isNaN(num / population)) {
            console.log("NaN", num, population)
        }
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
                if (newValue !== null && Number.isNaN(newValue)) {
                    console.log("NaN", fips, newValue)
                }
                newStatistics[fips] = newValue

                if (newValue !== null && newValue > max) {
                    max = newValue
                }
            })

            snapshots.push({ timestamp: snapshot.timestamp, statistics: newStatistics })
        })

        return { snapshots, max } as Timeline<number>
}

export default function formatTimeline(timeline: Timeline<CountyData>, isDataTotal: boolean, isDataRelative: boolean, isDataCases: boolean) {
    // Initialize mapping data
    const snapshots = timeline.snapshots.map(snapshot => {
        const newStatistics: any = {}

        Object.entries(snapshot.statistics).forEach(keyValue => {
            const fips = keyValue[0]
            const countyData = keyValue[1] as CountyData
            const value = isDataCases ? countyData.numInfected : countyData.numDead
            newStatistics[fips] = value
        })

        return { timestamp: snapshot.timestamp, statistics: newStatistics } as Snapshot
    })
    const max = timeline.max.numInfected
    let newMappingData: Timeline<number> = { snapshots, max }

    if (!isDataTotal) {
        newMappingData = timelineMap(newMappingData, getDelta)
    }

    if (isDataRelative) {
        newMappingData = timelineMap(newMappingData, getPercentage)
    }

    return newMappingData
}