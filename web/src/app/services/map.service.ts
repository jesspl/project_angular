import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { Projection } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import Layer from 'ol/layer/Layer';
import LayerSwitcher from 'ol-layerswitcher';
import { SettingsService } from './settings.service';
import { Style, Stroke, Fill, Circle } from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Map;
  baseLayersGroup: LayerGroup;
  myLayersGroup: LayerGroup;

  constructor(public settingsService: SettingsService) {
    this.baseLayersGroup = this.createBaseLayers();
    this.myLayersGroup = this.createMyLayers();
    this.map = this.createMap();
    this.addLayerSwitcherControl();
    this.addMousePositionControl();
    this.loadP1Layers();
  }

  createBaseLayers(): LayerGroup {
    var pnoa = new TileLayer({
      properties: { title: 'PNOA' },
      source: new TileWMS({
        url: "https://www.ign.es/wms-inspire/pnoa-ma?",
        params: { "LAYERS": "OI.OrthoimageCoverage", 'VERSION': "1.3.0", "TILED": "true", "FORMAT": "image/png" },
      })
    });
    var catastro = new TileLayer({
      properties: { title: 'Catastro' },
      source: new TileWMS({
        url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?',
        params: { 'LAYERS': 'Catastro', 'VERSION': '1.1.1', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png' }
      })
    });
    return new LayerGroup({
      properties: { title: 'Base Layers' },
      layers: [pnoa, catastro]
    });
  }

  createMyLayers(): LayerGroup {
    var callesSource = new VectorSource();
    var callesLayer = new VectorLayer({
      source: callesSource,
      properties: { title: 'Calles' },
      style: new Style({
        stroke: new Stroke({ color: 'blue', width: 2 })
      })
    });

    var semaforosSource = new VectorSource();
    var semaforosLayer = new VectorLayer({
      source: semaforosSource,
      properties: { title: 'Semaforos' },
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 1 })
        })
      })
    });

    var manzanasSource = new VectorSource();
    var manzanasLayer = new VectorLayer({
      source: manzanasSource,
      properties: { title: 'Manzanas' },
      style: new Style({
        stroke: new Stroke({ color: 'green', width: 2 }),
        fill: new Fill({ color: 'rgba(0, 255, 0, 0.1)' })
      })
    });

    return new LayerGroup({
      properties: { title: 'My Layers' },
      layers: [callesLayer, semaforosLayer, manzanasLayer]
    });
  }

  loadP1Layers() {
    const API = this.settingsService.API_URL;
    const geoJsonFormat = new GeoJSON();

    // Calles
    fetch(API + 'p1/calles/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const features = data.map((item: any) => {
          const f = geoJsonFormat.readFeature(JSON.parse(item.geom_geojson), {
            dataProjection: 'EPSG:25830',
            featureProjection: 'EPSG:25830'
          }) as any;
          f.setProperties(item);
          return f;
        });
        (this.getLayerByTitle('Calles') as VectorLayer<VectorSource>)?.getSource()?.addFeatures(features);
      });

    // Semaforos
    fetch(API + 'p1/semaforos/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const features = data.map((item: any) => {
          const f = geoJsonFormat.readFeature(JSON.parse(item.geom_geojson), {
            dataProjection: 'EPSG:25830',
            featureProjection: 'EPSG:25830'
          }) as any;
          f.setProperties(item);
          return f;
        });
        (this.getLayerByTitle('Semaforos') as VectorLayer<VectorSource>)?.getSource()?.addFeatures(features);
      });

    // Manzanas
    fetch(API + 'p1/manzanas/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const features = data.map((item: any) => {
          const f = geoJsonFormat.readFeature(JSON.parse(item.geom_geojson), {
            dataProjection: 'EPSG:25830',
            featureProjection: 'EPSG:25830'
          }) as any;
          f.setProperties(item);
          return f;
        });
        (this.getLayerByTitle('Manzanas') as VectorLayer<VectorSource>)?.getSource()?.addFeatures(features);
      });
  }

  createMap(): Map {
    let epsg25830 = new Projection({
      code: 'EPSG:25830',
      extent: [-729785.76, 3715125.82, 945351.10, 9522561.39],
      units: 'm'
    });
    return new Map({
      controls: [],
      view: new View({
        center: [729035, 4373419],
        zoom: 14,
        projection: epsg25830,
      }),
      layers: [this.baseLayersGroup, this.myLayersGroup],
      target: undefined
    });
  }

  addLayerSwitcherControl() {
    const layerSwitcher = new LayerSwitcher({
      activationMode: 'mouseover',
      startActive: true,
      tipLabel: 'Show-hide layers',
      groupSelectStyle: 'group',
      reverse: false
    });
    this.map.addControl(layerSwitcher);
  }

  addMousePositionControl() {
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(0),
      projection: 'EPSG:25830',
    });
    this.map.addControl(mousePositionControl);
  }

  getLayerByTitle(title: string, layers?: BaseLayer[]): Layer<any> | undefined {
    const currentLayers = layers || this.map.getLayers().getArray();
    for (const baseLayer of currentLayers) {
      if (this.isLayer(baseLayer)) {
        if (baseLayer.getProperties()['title'] === title) return baseLayer;
      } else if (this.isLayerGroup(baseLayer)) {
        const found = this.getLayerByTitle(title, baseLayer.getLayers().getArray());
        if (found) return found;
      }
    }
    return undefined;
  }

  private isLayer(layer: BaseLayer): layer is Layer<any> {
    return (layer as Layer<any>).getSource !== undefined;
  }

  private isLayerGroup(layer: BaseLayer): layer is LayerGroup {
    return (layer as LayerGroup).getLayers !== undefined;
  }

  disableMapInteractions(): void {
    this.map.getInteractions().forEach
  }}