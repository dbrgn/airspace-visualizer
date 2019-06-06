export interface Altitude {
    type: 'Gnd' | 'FeetAmsl' | 'FeetAgl' | 'FlightLevel' | 'Unlimited' | 'Other',
    val?: number | string,
}

export interface Coord {
    lat: number,
    lng: number,
}

export interface PolygonSegment {
    type: 'Point' | 'Arc' | 'ArcSegment',
}

export interface Arc extends PolygonSegment {
    centerpoint: Coord,
    start: Coord,
    end: Coord,
    direction: 'Cw' | 'Ccw',
}

export interface ArcSegment extends PolygonSegment {
    centerpoint: Coord,
    radius: number,
    angle_start: number,
    angle_end: number,
    direction: 'Cw' | 'Ccw',
}

export interface Point extends PolygonSegment, Coord { }

export interface Geometry {
    type: 'Polygon' | 'Circle',
    segments?: PolygonSegment[],
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
