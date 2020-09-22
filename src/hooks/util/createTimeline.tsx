import moment from 'moment';
import { Fips, CovidStatistics, Snapshot } from '../../interfaces';
import { DSVRowArray, DSVRowString } from 'd3';
import PlaceFactory from '../../PlaceFactory'

function fipsesForRow(row: DSVRowString<string>) {
    if (row.county === "New York City") {
        return [36061, 36047, 36081, 36005, 36085]
    } else {
        return [parseInt(row.fips!)]
    }
}

function getStatistics(
    population: number, 
    numInfected: number, 
    numDead: number, 
    previousSnapshotStatistics: CovidStatistics | null | undefined
) {
    // In the case of New York, we have data for all the counties aggregated, so we want to 
    // divide that by the population in all new york city counties to get the percent
    const percentInfected = numInfected / population;
    const percentDead = numDead / population;
    const percentNewlyInfected = previousSnapshotStatistics ? (
        percentInfected - previousSnapshotStatistics.percentInfected
    ) : (
        percentInfected
    );
    const percentNewlyDead = previousSnapshotStatistics ? (
        percentDead - previousSnapshotStatistics.percentDead
    ) : (
        percentDead
    );

    return { percentInfected, percentDead, percentNewlyInfected, percentNewlyDead }
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

    const snapshots: Snapshot[] = snapshotRowGroups.reduce((snapshots, snapshotRows) => {
        const timestamp = moment(snapshotRows[0].date).valueOf()
        const countyStatistics = snapshotRows.reduce((statistics, row) => {
            const fipses = fipsesForRow(row)

            fipses.forEach(fips => {
                const place = PlaceFactory(fips)
                const population = place.getPopulation()
                const numInfected = parseInt(row.cases!)
                const numDead = parseInt(row.deaths!)
                const previousSnapshotCountyStatistics = snapshots.length > 0 ? (
                    snapshots[snapshots.length - 1].statistics.get(fips)
                ) : (
                    null
                );
                
                const countyStatistics = getStatistics(
                    population,
                    numInfected,
                    numDead,
                    previousSnapshotCountyStatistics
                )
                statistics.set(fips, countyStatistics)
            })

            return statistics
        }, new Map<Fips, CovidStatistics>())

        snapshots.push({ timestamp, statistics: countyStatistics })

        return snapshots
    }, new Array<Snapshot>())

    const highs = snapshots.reduce((highs, snapshot) => {
        snapshot.statistics.forEach((statistics) => {
            const { percentInfected, percentDead, percentNewlyInfected, percentNewlyDead } = statistics
            
            if (percentInfected > highs.percentInfected) {
                highs.percentInfected = percentInfected;
            }
            if (percentDead > highs.percentDead) {
                highs.percentDead = percentDead;
            }
            if (percentNewlyInfected > highs.percentNewlyInfected) {
                highs.percentNewlyInfected = percentNewlyInfected;
            }
            if (percentNewlyDead > highs.percentNewlyDead) {
                highs.percentNewlyDead = percentNewlyDead;
            }
        })

        return highs
    }, {
        percentInfected: 0,
        percentDead: 0,
        percentNewlyInfected: 0,
        percentNewlyDead: 0,
    })

    return { snapshots, highs };
}
