// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-draw-calle',
//   standalone: true,
//   imports: [],
//   templateUrl: './draw-calle.component.html',
//   styleUrl: './draw-calle.component.scss'
// })
// export class DrawCalleComponent {

// }

import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MapService } from '../../services/map.service';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { WKT } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-draw-calle',
  standalone: true,
  imports: [MatIconModule, MatTooltip, MatButtonModule],
  templateUrl: './draw-calle.component.html',
  styleUrl: './draw-calle.component.scss'
})
export class DrawCalleComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawCalle: Draw | undefined;

  constructor(
    public mapService: MapService,
    public router: Router,
    public eventService: EventService
  ) {
    // Igual que el profesor: escucha eventos y resetea drawMode si no es el suyo
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawCalleActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Igual que el profesor: inicializa y deshabilita al arrancar
    this.addDrawCalleInteraction();
    this.disableDrawCalle();
    this.reloadCallesVectorLayer();
  }

  toggleDrawMode() {
    // Igual que el profesor: toggle on/off
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawCalle();
    } else {
      this.disableDrawCalle();
      this.clearVectorLayer();
      this.reloadCallesVectorLayer();
    }
  }

  addDrawCalleInteraction() {
    // Ajuste: nombre de capa 'Calles' y tipo 'LineString'
    var source: VectorSource = this.mapService.getLayerByTitle('Calles')?.getSource();
    if (source) {
      this.drawCalle = new Draw({
        source: source,
        type: 'LineString'  // Ajuste: LineString para calles
      });
      this.drawCalle.on('drawend', this.manageDrawEnd);
      this.mapService.map.addInteraction(this.drawCalle);
    } else {
      console.error('Calles layer not found');
    }
  }

  enableDrawCalle() {
    // Igual que el profesor: deshabilita otras interacciones y emite evento
    this.mapService.disableMapInteractions();
    this.drawCalle!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawCalleActivated', {}));
  }

  disableDrawCalle() {
    this.drawCalle!.setActive(false);
  }

  clearVectorLayer() {
    // Igual que el profesor: limpia la capa vectorial
    this.mapService.getLayerByTitle('Calles')?.getSource().clear();
  }

  reloadCallesVectorLayer() {
    // Ajuste: sin GeoServer recargamos la capa vectorial desde la API
    // (equivale al reloadBuildingsWmsLayer del profesor pero para vectorial)
    const layer = this.mapService.getLayerByTitle('Calles');
    if (layer) {
      layer.getSource()?.clear();
    }
  }

  // Igual que el profesor: funcion flecha para mantener contexto de 'this'
  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    // Ajuste: navega a calles-form con la geometria dibujada en queryParams
    this.router.navigate(['/calles-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    // Igual que el profesor: elimina la interaccion al destruir el componente
    if (this.drawCalle) {
      this.mapService.map?.removeInteraction(this.drawCalle);
    }
  }
}