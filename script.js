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
    console.log(j)
    for (const x of j.elements){
        switch (x.type) {
            case 'node':
                if(!(x.id in osm.nodes)){
                    let lin = L.circleMarker(L.latLng(x.lat, x.lon), 10);
                    lin.addTo(map);
                    osm.nodes[x.id] = lin;
                    }
                break;
            case 'way':
                if(!(x.id in osm.ways)){
                    if(x.nodes[0] == x.nodes[x.nodes.length -1]){
                        // gesloten vlak
                        var ps = [];
                        for (const i of x.nodes){
                            let p = osm.nodes[i];
                            ps.push([p.getLatLng().lat, p.getLatLng().lng]);
                        }
                        console.log(ps);
                        let liw = L.polygon(ps, {color: 'red'});
                        console.log(liw);
                        liw.addTo(map)
                        osm.ways[x.id] = liw;
                    } else {
                        // open lijn
                        }
                    }
                break;
            default:
                break;
        }
    }
}