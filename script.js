var map = L.map('map').setView([51.4350, 5.3995], 13);
L.tileLayer('https://hisgis.nl/wmts/minuutplans/cut/{z}/{x}/{y}', {
    maxZoom: 19,
    attribution: 'HisGIS'
}).addTo(map);

// https://osm.hisgis.nl/api/0.6/map.json?bbox=5.452877299599473,51.40064810552208,5.458190755657975,51.40303089636736

document.getElementById("checkvenster").onclick = async function(){
    let url = "https://osm.hisgis.nl/api/0.6/map.json?bbox=";
    url += map.getBounds().toBBoxString();
    //document.getElementById("bericht").innerHTML += map.getBounds().toBBoxString();
    const response = await fetch(url);
    const jsonData = await response.json();
    verwerk(jsonData);
    //console.log(jsonData);
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
var jsonget;

function isPerceel(x){
    return 'tags' in x && ('kad:gemeente' in x.tags || 'kad:sectie' in x.tags || 'kad:perceelnr' in x.tags )
}

async function addWay(x){
    if(!(x.id in osm.ways) ){
        if(x.nodes[0] == x.nodes[x.nodes.length -1]){
            // gesloten vlak
            var ps = [];
            for (const i of x.nodes){
                let p = osm.nodes[i];
                ps.push([p.getLatLng().lat, p.getLatLng().lng]);
            }
            let liw = L.polygon(ps, {color: 'red'});
            if(isPerceel(x)){liw.addTo(map);}
            osm.ways[x.id] = liw;
        } else {
            // open lijn
            var ps = [];
            for (const i of x.nodes){
                let p = osm.nodes[i];
                ps.push([p.getLatLng().lat, p.getLatLng().lng]);
            }
            let liw = L.polyline(ps, {color: 'green'});
            if(isPerceel(x)){liw.addTo(map);}
            osm.ways[x.id] = liw;
            }
        }
}

function verwerk(j){
    console.log(j)
    jsonget = j;
    for (const x of j.elements){
        switch (x.type) {
            case 'node':
                if(!(x.id in osm.nodes)) {
                let lin = L.circleMarker(L.latLng(x.lat, x.lon), 10);
                if(isPerceel(x)){lin.addTo(map);}
                osm.nodes[x.id] = lin;
                }
                break;
            case 'way':
                addWay(x);
                break;
            case 'relation':
                if(!(x.id in osm.relations) && 'members' in x){
                    rs = {};
                    rs.outer = [];
                    rs.inner = [];
                    for (const m of x.members){
                        if(m.type=='way'){
                                if(m.ref in osm.ways){
                                    var ps = [];
                                    var w = osm.ways[m.ref];
                                    for (const p of w.getLatLngs()){
                                        //let p = osm.nodes[i];
                                        //console.log(i);
                                        var pis = [];
                                        //console.log(p);
                                        for (const pi of p){
                                        pis.push([pi.lat, pi.lng]);
                                        }
                                        ps.push(pis);
                                    }
                                rs[m.role].push(ps);
                                } else {
                                    // member-way niet aanwezig als lid van relatie; ophalen
                                    let url = "https://osm.hisgis.nl/api/0.6/way/#" + m.ref + ".json";
                                    const response = await fetch(url);
                                    const jsonData = await response.json();
                                    console.log(jsonData);
                                    await addWay(jsonData.elements[0]);
                                    console.log("way met id " + m.ref + " niet gevonden.");
                                }
                        }
                    }
                    let y = [rs.outer, rs.inner];
                    let lir = L.polygon(y.flat(), {color: 'purple'});
                    if(isPerceel(x)){lir.addTo(map);}
                    osm.relations[x.id] = lir;
                }

                break;
            default:
                break;
        }
    }
}