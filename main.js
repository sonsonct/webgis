import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import 'ol/ol.css';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import View from 'ol/View.js';
import LayerSwitcher from 'ol-layerswitcher';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import XYZ from 'ol/source/XYZ.js';
import { toLonLat } from 'ol/proj.js';
import { toStringHDMS } from 'ol/coordinate.js';
import Overlay from 'ol/Overlay.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';

const layers = [
  new TileLayer({
    title: 'world map',
    source: new OSM(),
  }),
  new TileLayer({
    title: 'roads map',
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/busdb/wms',
      params: { 'LAYERS': 'busdb:roads', 'TILED': true },
      serverType: 'geoserver',
    }),
  }),
  new TileLayer({
    title: 'points-map',
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/busdb/wms',
      params: { 'LAYERS': 'busdb:points', 'TILED': true},
      serverType: 'geoserver',
    }),
  }),
];
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [11775000, 2397000],
    zoom: 15,
  }),
});

//layer switcher
const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);


//mount position
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

map.addControl(mousePositionControl);
const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  mousePositionControl.setProjection(event.target.value);
});
const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
  const format = createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});
//popup
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};
map.addOverlay(overlay)
map.on('singleclick', function (evt) {
  //const coordinate = evt.coordinate;
  // //const hdms = toStringHDMS(toLonLat(coordinate));
  // map.getLayers().forEach(layer => {
  //   if (layer && layer.get('title') === 'points-map') {
  //     const coordinate = evt.coordinate; //toa do x, y

  //     content.innerHTML = '<p>Vị trí:</p><code>' + layer.get("type") + '</code>';
  //     overlay.setPosition(coordinate);

  //   }
  // });
  const coordinate = evt.coordinate; //toa do x, y

  content.innerHTML = '<p>Vị trí:</p><code>' + toLonLat(coordinate) + '</code>';
  overlay.setPosition(coordinate);
});

//search point
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function (event) {
  searchPoint();
});
function searchPoint(){
  map.getLayers().forEach(layer => {
    if (layer && layer.get('title') === 'points-map') {
      map.removeLayer(layer);
      
    }
    //console.log(layer)
    
  });
  var name = document.getElementById("namePoint").value;
  const searchlayer =  new TileLayer({
    title: 'points-map',
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/busdb/wms',
      params: { 'LAYERS': 'busdb:points', 'TILED': true, 'CQL_Filter': 'name LIKE' + "'%" + name + "%'" },
      serverType: 'geoserver',
    }),
  });
  if(name!=""){
    map.addLayer(searchlayer);
  }else{
    map.removeLayer(searchlayer);
    //console.log(name+"a")
  }
  
  
}



// import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';

// const vectorSource = new VectorSource({
//   format: new GeoJSON(),
//   url: function () {
//     return (
//       "http://localhost:8080/geoserver/busdb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=busdb%3Apoints&maxFeatures=50&outputFormat=application%2Fjson"
//     );
//   },
//   strategy: bboxStrategy,
// });

// const vector = new VectorLayer({
//   title: 'vecto',
//   source: vectorSource,
//   style: {
//     'stroke-width': 0.75,
//     'stroke-color': 'white',
//     'fill-color': 'rgba(100,100,100,0.25)',
//   },
// });
// console.log(vector.get("FeatureCollection"))
// map.addLayer(vector)
