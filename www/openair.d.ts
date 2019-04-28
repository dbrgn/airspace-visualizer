export interface Altitude {
    type: 'Gnd' | 'FeetAgl' | 'FeetAmsl',
    val?: number,
}

export interface Coord {
    lat: number,
    lng: number,
}

export interface Geometry {
    type: 'Polygon' | 'Circle',
    points?: Coord[],
    centerpoint?: Coord,
    radius?: number,
}

export interface Airspace {
    name: string,
    class: 'A' | 'B' | 'C' | 'D' | 'E' | 'CTR' | 'Restricted' | 'Danger' | 'Prohibited' | 'GliderProhibited' | 'WaveWindow',
    lowerBound: Altitude,
    upperBound: Altitude,
    geom: Geometry,
}
