var map = L.map('map').setView([51.4350, 5.3995], 13);
L.tileLayer('https://hisgis.nl/wmts/minuutplans/cut/{z}/{x}/{y}', {
    maxZoom: 19,
    attribution: 'HisGIS'
}).addTo(map);

// https://osm.hisgis.nl/api/0.6/map.json?bbox=5.452877299599473,51.40064810552208,5.458190755657975,51.40303089636736

document.getElementById("checkvenster").onclick = async function(){
    let url = "https://osm.hisgis.nl/api/0.6/map.json?bbox=";
    url += map.getBounds().toBBoxString();
    document.getElementById("bericht").innerHTML += map.getBounds().toBBoxString();
    const response = await fetch(url);
    const jsonData = await response.json();
    verwerk(jsonData);
}

class OSM{
    constructor(){
        this.nodes = [];
        this.ways = [];
        this.relations = [];
        this.percelen = [];
    }
}

var osm = new OSM()

function verwerk(j){
    for (const x of j.elements){
        switch (x.type) {
            case node:
                osm.nodes[x.id] = L.circleMarker(LatLng(x.lat, x.lon), 10);
                break;
        
            default:
                break;
        }
        osm.nodes.push()
    }
}