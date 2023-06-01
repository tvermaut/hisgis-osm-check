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
        this.nodes = {};
        this.ways = {};
        this.relations = {};
        this.percelen = [];
    }
}

var osm = new OSM()
var jsonget;

function isPerceel(x){
    return 'tags' in x && ('kad:gemeente' in x.tags || 'kad:sectie' in x.tags || 'kad:perceelnr' in x.tags )
}

async function addNode(ref){
    if(!(ref in osm.nodes) ){
        let url = "https://osm.hisgis.nl/api/0.6/node/" + ref + ".json";
        const response = await fetch(url);
        const jsonData = await response.json();
        let x = jsonData.elements[0]
        let lin = L.circleMarker(L.latLng(x.lat, x.lon), 10);
        if(isPerceel(x)){lin.addTo(map);}
        osm.nodes[x.id] = lin;
        }
        return true
}

async function addWay(ref){
    if(!(ref in osm.ways) ){
        let url = "https://osm.hisgis.nl/api/0.6/way/" + ref + ".json";
        const response = await fetch(url);
        const jsonData = await response.json();
        let x = jsonData.elements[0]
        addWayWithData(x)
        }

    return true
}

async function addWayWithData(x){
    if(!(x.id in osm.ways) ){
        if(x.nodes[0] == x.nodes[x.nodes.length -1]){
            // gesloten vlak
            var ps = [];
            for (const i of x.nodes){
                if(i in osm.nodes){
                    let p = osm.nodes[i];
                    ps.push([p.getLatLng().lat, p.getLatLng().lng]);
                } else {
                    addNode(i)
                }
            }
            let liw = L.polygon(ps, {color: 'red'});
            if(isPerceel(x)){liw.addTo(map);}
            osm.ways[x.id] = liw;
        } else {
            // open lijn
            var ps = [];
            for (const i of x.nodes){
                if(i in osm.nodes){
                    let p = osm.nodes[i];
                    ps.push([p.getLatLng().lat, p.getLatLng().lng]);
                } else {
                    addNode(i);
                }
            }
            let liw = L.polyline(ps, {color: 'green'});
            if(isPerceel(x)){liw.addTo(map);}
            osm.ways[x.id] = liw;
            }
        }
        return true
}

async function verwerk(j){
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
                addWayWithData(x);
                break;
            case 'relation':
                if(!(x.id in osm.relations) && 'members' in x){
                    console.log("nieuwe relatie r"+x.id)
                    console.log(x)
                    rs = {};
                    rs.outer = [];
                    rs.inner = [];
                    const maakMulti = async () => {
                        for (const m of x.members){
                            console.log(m)
                                await addWay(m.ref).then(function(){
                                    console.log("member " + m.ref + " toegevoegd.")
                                    var w = osm.ways[m.ref]
                                    var ps = [];
                                    for (const p of w.getLatLngs()){
                                        var pis = [];
                                        for (const pi of p){pis.push([pi.lat, pi.lng]);}
                                        ps.push(pis);
                                        }
                                    rs[m.role].push(ps);
                                    })
                            }
                        let y = [rs.outer, rs.inner];
                        let lir = L.polygon(y.flat(), {color: 'purple'});
                        if(isPerceel(x)){lir.addTo(map);}
                        osm.relations[x.id] = lir;
                        }
                }
                break;
            default:
                break;
        }
    }
}