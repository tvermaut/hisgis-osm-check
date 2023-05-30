var map = L.map('map').setView([51.4350, 5.3995], 13);
L.tileLayer('https://hisgis.nl/wmts/minuutplans/cut/{z}/{x}/{y}', {
    maxZoom: 19,
    attribution: 'HisGIS'
}).addTo(map);