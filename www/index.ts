import {process_openair} from 'airspace-visualizer';
import {Airspace, Altitude, PolygonSegment, Point, Arc, ArcSegment} from './openair';
import {initDragAndDrop} from './drag_drop';
import {feetToMeters, nauticalMilesToMeters} from './units';
import * as L from 'leaflet';

// DOM elements
const mapdiv = document.getElementById("map");
const dropzone = document.getElementById("wrapper");
const dropinfo = document.getElementById("dropinfo");
const airspaceinfo = document.getElementById("airspaceinfo");

// Styling
const defaultWeight = 2;
const highlightedWeight = 5;
const defaultStyle = {
    weight: defaultWeight,
    opacity: 0.6,
    interactive: true,
};

function altitudeToText(altitude: Altitude): string {
    switch (altitude.type) {
        case 'Gnd':
            return 'GND';
        case 'FeetAmsl':
            return `${feetToMeters(altitude.val as number)} m AMSL`;
        case 'FeetAgl':
            return `${feetToMeters(altitude.val as number)} m AGL`;
        case 'FlightLevel':
            return `FL ${altitude.val}`;
        case 'Unlimited':
            return `Unlimited`;
        case 'Other':
            return `?(${altitude.val})`;
        default:
            throw new Error(`Invalid altitude type: ${altitude.type}`);
    }
}

/**
 * Highlight an airspace on the mouseover event.
 */
function highlightAirspace(airspace: Airspace): L.LeafletMouseEventHandlerFn {
    const name: HTMLElement = airspaceinfo.querySelector('.name');
    const classification: HTMLElement = airspaceinfo.querySelector('.class');
    const bounds: HTMLElement = airspaceinfo.querySelector('.bounds');
    return (e: L.LeafletMouseEvent) => {
        const polygon = e.target as any as L.Polyline;
        polygon.setStyle({
            weight: highlightedWeight,
        });

        name.innerText = airspace.name;
        classification.innerText = `Class ${airspace.class}`;
        bounds.innerText = `From ${altitudeToText(airspace.lowerBound)} to ${altitudeToText(airspace.upperBound)}`;
        airspaceinfo.classList.remove('hidden');
    };
}

/**
 * Reset highlights on the mouseout event.
 */
function resetHighlight(e: L.LeafletMouseEvent) {
    const polygon = e.target as any as L.Polyline;
    polygon.setStyle({
        weight: defaultWeight,
    });
    airspaceinfo.classList.add('hidden');
}

/**
 * Zoom to the airspace on click.
 */
function zoomToAirspace(e: L.LeafletMouseEvent) {
    const polygon = e.target as any as L.Polyline;
    map.fitBounds(polygon.getBounds());
}

function isPoint(segment: PolygonSegment): segment is Point {
    return segment.type == "Point";
}

function isArc(segment: PolygonSegment): segment is Arc {
    return segment.type == "Arc";
}

function isArcSegment(segment: PolygonSegment): segment is ArcSegment {
    return segment.type == "ArcSegment";
}

/**
 * Add the airspace to the map.
 */
function showAirspace(airspace: Airspace): L.Path {
    // Colors based on https://www.materialpalette.com/colors
    let color;
    switch (airspace.class) {
        case 'A':
            color = '#2196f3';  // Blue
            break;
        case 'B':
            color = '#00bcd4';  // Cyan
            break;
        case 'C':
            color = '#3f51b5';  // Indigo
            break;
        case 'D':
            color = '#9c27b0';  // Purple
            break;
        case 'E':
            color = '#e91e63';  // Pink
            break;
        case 'CTR':
            color = '#f44336';  // Red
            break;
        case 'Restricted':
            color = '#ffc107';  // Amber
            break;
        case 'Danger':
            color = '#4caf50';  // Green
            break;
        case 'Prohibited':
        case 'GliderProhibited':
            color = '#ff5722';  // Deep Orange
            break;
        case 'WaveWindow':
            color = '#607d8b';  // Blue Grey
            break;
        default:
            color = 'grey';
    }
    switch (airspace.geom.type) {
        case "Polygon":
            const polygon = L.polygon(
                airspace.geom.segments.filter(isPoint).map((obj) => {
                    if (isPoint(obj)) {
                        return [obj.lat, obj.lng];
                    }
                }),
                Object.assign(defaultStyle, {
                    color: color,
                }),
            );
            polygon.addEventListener('mouseover', highlightAirspace(airspace));
            polygon.addEventListener('mouseout', resetHighlight);
            polygon.addEventListener('click', zoomToAirspace);
            polygon.addTo(map);
            return polygon;
        case "Circle":
            const circle = L.circle(
                airspace.geom.centerpoint,
                Object.assign(defaultStyle, {
                    color: color,
                    radius: nauticalMilesToMeters(airspace.geom.radius),
                }),
            );
            circle.addEventListener('mouseover', highlightAirspace(airspace));
            circle.addEventListener('mouseout', resetHighlight);
            circle.addEventListener('click', zoomToAirspace);
            circle.addTo(map);
            return circle;
        default:
            throw new Error(`Unhandled geometry type: ${airspace.geom.type}`);
    }
}

function loadFile(files: FileList) {
    for (const file of files) {
        console.log('Loading file...', file);
        const reader = new FileReader();
        reader.onload = function(e: ProgressEvent) {
            // Get u8 view of arraybuffer
            const bytes = new Uint8Array(this.result as ArrayBuffer);

            // Process bytes
            const result: Airspace[] = process_openair(bytes);
            console.log('Data returned by WASM:', result);

            if (result !== null) {
                // Sort airspaces
                result.sort((a1: Airspace, a2: Airspace) => {
                    // Polygons are usually larger, put them at the bottom
                    if (a1.geom.type === 'Polygon' && a2.geom.type === 'Circle') {
                        return -1;
                    } else if (a1.geom.type === 'Circle' && a2.geom.type === 'Polygon') {
                        return 1;
                    }

                    // Put larger circles at the bottom
                    if (a1.geom.type === 'Circle' && a2.geom.type === 'Circle') {
                        if (a1.geom.radius > a2.geom.radius) {
                            return -1;
                        } else if (a1.geom.radius < a2.geom.radius) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }

                    return 0;
                });

                // Add airspaces to map
                const paths = [];
                for (const airspace of result) {
                    paths.push(showAirspace(airspace));
                }

                // Fit map to bounds
                const group = L.featureGroup(paths);
                map.fitBounds(group.getBounds());
            } else {
                alert('No airspaces could be found. Is it a valid OpenAir file?');
            }
        };
        reader.onerror = function(e: ProgressEvent) {
            // TODO
            alert('Processing file failed');
        };
        reader.readAsArrayBuffer(file);
    }
}

initDragAndDrop(mapdiv, dropzone, dropinfo, loadFile);

const map = L.map('map').setView([46.76733810404278, 8.496828420038582], 6);

// Add tiles
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    id: 'danilo/citrnqoyx000h2jmg5qenf8ep',
    accessToken: 'pk.eyJ1IjoiZGFuaWxvIiwiYSI6IkM2cVZZdkkifQ.KK_4WqiWBL_DhpjIfGPcLw',
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
} as any).addTo(map);
