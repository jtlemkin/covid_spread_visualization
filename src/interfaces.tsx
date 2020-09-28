export type Fips = number

export interface Timeline<T> {
    snapshots: Snapshot<T>[],
    max: T,
}

export interface Snapshot<T> {
    timestamp: number,
    statistics: Map <Fips, T>
}

export interface CountyData {
    numInfected: number,
    numDead: number,
}

export interface DataEntry {
    date: string,
    fips: number,
    cases: number,
    deaths: number,
}

export interface Dated {
    value: number,
    date: Date
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
