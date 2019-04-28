import {process_openair} from 'airspace-visualizer';
import {Airspace} from './openair';
import {initDragAndDrop} from './drag_drop';
import * as L from 'leaflet';

const mapdiv = document.getElementById("map");
const dropzone = document.getElementById("wrapper");
const dropinfo = document.getElementById("dropinfo");

function showAirspace(airspace: Airspace) {
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
            console.log('Class is ', airspace.class);
            color = 'grey';
    }
    switch (airspace.geom.type) {
        case "Polygon":
            L.polygon(
                airspace.geom.points.map((obj) => [obj.lat, obj.lng]),
                {color: color, weight: 2, opacity: 0.6},
            ).addTo(map);
            break;
        case "Circle":
            // TODO
            break;
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
            const result = process_openair(bytes);
            console.log('Data returned by WASM:', result);

            // Show airspaces
            if (result !== null) {
                for (const airspace of result) {
                    showAirspace(airspace);
                }
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

const map = L.map('map').setView([46.76733810404278, 8.496828420038582], 8);

// Add tiles
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    id: 'danilo/citrnqoyx000h2jmg5qenf8ep',
    accessToken: 'pk.eyJ1IjoiZGFuaWxvIiwiYSI6IkM2cVZZdkkifQ.KK_4WqiWBL_DhpjIfGPcLw',
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
} as any).addTo(map);