export type Fips = number

export interface Timeline {
    snapshots: Snapshot[],
    highs: CovidStatistics
}

export interface Snapshot {
    timestamp: number,
    countyStatistics: Map <Fips, CovidStatistics>
}

export interface CovidStatistics {
    percentInfected: number,
    percentDead: number,
    percentNewlyInfected: number,
    percentNewlyDead: number,
}