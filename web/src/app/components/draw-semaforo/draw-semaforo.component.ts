// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-draw-semaforo',
//   standalone: true,
//   imports: [],
//   templateUrl: './draw-semaforo.component.html',
//   styleUrl: './draw-semaforo.component.scss'
// })
// export class DrawSemaforoComponent {

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
  selector: 'app-draw-semaforo',
  standalone: true,
  imports: [MatIconModule, MatTooltip, MatButtonModule],
  templateUrl: './draw-semaforo.component.html',
  styleUrl: './draw-semaforo.component.scss'
})
export class DrawSemaforoComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawSemaforo: Draw | undefined;

  constructor(
    public mapService: MapService,
    public router: Router,
    public eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawSemaforoActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.addDrawSemaforoInteraction();
    this.disableDrawSemaforo();
    this.reloadSemaforosVectorLayer();
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawSemaforo();
    } else {
      this.disableDrawSemaforo();
      this.clearVectorLayer();
      this.reloadSemaforosVectorLayer();
    }
  }

  addDrawSemaforoInteraction() {
    // Ajuste: nombre de capa 'Semaforos' y tipo 'Point'
    var source: VectorSource = this.mapService.getLayerByTitle('Semaforos')?.getSource();
    if (source) {
      this.drawSemaforo = new Draw({
        source: source,
        type: 'Point'  // Ajuste: Point para semaforos
      });
      this.drawSemaforo.on('drawend', this.manageDrawEnd);
      this.mapService.map.addInteraction(this.drawSemaforo);
    } else {
      console.error('Semaforos layer not found');
    }
  }

  enableDrawSemaforo() {
    this.mapService.disableMapInteractions();
    this.drawSemaforo!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawSemaforoActivated', {}));
  }

  disableDrawSemaforo() {
    this.drawSemaforo!.setActive(false);
  }

  clearVectorLayer() {
    this.mapService.getLayerByTitle('Semaforos')?.getSource().clear();
  }

  reloadSemaforosVectorLayer() {
    const layer = this.mapService.getLayerByTitle('Semaforos');
    if (layer) {
      layer.getSource()?.clear();
    }
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    // Ajuste: navega a semaforos-form
    this.router.navigate(['/semaforos-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    if (this.drawSemaforo) {
      this.mapService.map?.removeInteraction(this.drawSemaforo);
    }
  }
}