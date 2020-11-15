export type Fips = number

export interface Timeline<T> {
    snapshots: Snapshot[],
    max: T,
}

export interface Snapshot {
    timestamp: number,
    statistics: any
}

export interface CountyData {
    numInfected: number,
    numDead: number,
}

export interface DataEntry {
    date: number,
    fips: number,
    value: number,
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

export interface LabelledColor {
    color: string,
    label: string,
}

type Result = [number, string]
