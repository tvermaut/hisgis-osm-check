var map = L.map('map').setView([51.4350, 5.3995], 13);
L.tileLayer('https://hisgis.nl/wmts/minuutplans/cut/{z}/{x}/{y}', {
    maxZoom: 19,
    attribution: 'HisGIS'
}).addTo(map);

document.getElementById("checkvenster").onclick = async function(){
    let url = "https://osm.hisgis.nl/api/0.6/map.json?bbox=";
    url += map.getBounds().toBBoxString();
    document.getElementById("bericht").innerHTML += map.getBounds().toBBoxString();
    const response = await fetch(url);
    const jsonData = await response.json();
    console.log(jsonData);
}