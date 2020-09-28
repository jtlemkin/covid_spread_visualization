import moment from 'moment';
import { Fips, CountyData, Snapshot, Timeline } from '../interfaces';
import { DSVRowArray, DSVRowString } from 'd3';

function fipsesForRow(row: DSVRowString<string>) {
    if (row.county === "New York City") {
        return [36061, 36047, 36081, 36005, 36085]
    } else {
        return [parseInt(row.fips!)]
    }
}

function isValidRow(row: DSVRowString<string>) {
    const blacklistedStates = ["Virgin Islands", "Puerto Rico", "Northern Mariana Islands"];

    return (
        row.county! !== "Unknown" && 
        !blacklistedStates.includes(row.state!) &&
        row.county !== "Kansas City" && // The data for Kansas City is spread among different counties
        row.county !== "Joplin" // The same goes for Joplin
    )
}

export function createTimeline(covidData: DSVRowArray) {
    const snapshotRowGroups = covidData.reduce((snapshotRowGroups, row) => {
        if (!isValidRow(row)) {
            return snapshotRowGroups //continue
        }

        const lastGroup = snapshotRowGroups.length > 0 ? snapshotRowGroups[snapshotRowGroups.length - 1] : null
        if (!lastGroup || moment(row.date).valueOf() > moment(lastGroup[0].date).valueOf()) {
            snapshotRowGroups.push([row])
        } else {
            lastGroup.push(row)
        }

        return snapshotRowGroups
    }, new Array<Array<DSVRowString<string>>>())

    const snapshots: Snapshot<CountyData>[] = snapshotRowGroups.reduce((snapshots, snapshotRows) => {
        const timestamp = moment(snapshotRows[0].date).valueOf()
        const countyStatistics = snapshotRows.reduce((statistics, row) => {
            const fipses = fipsesForRow(row)

            fipses.forEach(fips => {
                const numInfected = parseInt(row.cases!)
                const numDead = parseInt(row.deaths!)
                
                statistics.set(fips, { numInfected, numDead })
            })

            return statistics
        }, new Map<Fips, CountyData>())

        snapshots.push({ timestamp, statistics: countyStatistics })

        return snapshots
    }, new Array<Snapshot<CountyData>>())

    const max = snapshots.reduce((highs, snapshot) => {
        snapshot.statistics.forEach((statistics) => {
            const { numInfected, numDead } = statistics
            
            if (numInfected > highs.numInfected) {
                highs.numInfected = numInfected;
            }
            if (numDead > highs.numDead) {
                highs.numDead = numDead;
            }
        })

        return highs
    }, {
        numInfected: 0,
        numDead: 0,
        numNewlyInfected: 0,
        numNewlyDead: 0,
    })

    

    return { snapshots, max } as Timeline<CountyData>;
}
