export type Fips = number

export interface Timeline {
    snapshots: Snapshot[],
    highs: CovidStatistics
}

export interface Snapshot {
    timestamp: number,
    statistics: Map <Fips, CovidStatistics>
}

export interface DataEntry {
    date: string,
    fips: number,
    cases: number,
    deaths: number,
}

export interface CovidStatistics {
    percentInfected: number,
    percentDead: number,
    percentNewlyInfected: number,
    percentNewlyDead: number,
}

export interface Place {
    fips: number,
    name: string,
    type: string,
    getPopulation: () => number,
    getTransform: () => Transform,
    contains: (otherFips: number) => boolean,
    getOwner: () => Place | null,
}

export interface Transform {
    scale: number,
    scaleAdjustedTranslation: [number, number]
}

export interface City {
    name: string,
    lat: number,
    lng: number,
    county_fips: number,
}
