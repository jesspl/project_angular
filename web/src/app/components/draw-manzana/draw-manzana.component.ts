// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-draw-manzana',
//   standalone: true,
//   imports: [],
//   templateUrl: './draw-manzana.component.html',
//   styleUrl: './draw-manzana.component.scss'
// })
// export class DrawManzanaComponent {

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
  selector: 'app-draw-manzana',
  standalone: true,
  imports: [MatIconModule, MatTooltip, MatButtonModule],
  templateUrl: './draw-manzana.component.html',
  styleUrl: './draw-manzana.component.scss'
})
export class DrawManzanaComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawManzana: Draw | undefined;

  constructor(
    public mapService: MapService,
    public router: Router,
    public eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawManzanaActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.addDrawManzanaInteraction();
    this.disableDrawManzana();
    this.reloadManzanasVectorLayer();
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawManzana();
    } else {
      this.disableDrawManzana();
      this.clearVectorLayer();
      this.reloadManzanasVectorLayer();
    }
  }

  addDrawManzanaInteraction() {
    // Ajuste: nombre de capa 'Manzanas' y tipo 'Polygon'
    var source: VectorSource = this.mapService.getLayerByTitle('Manzanas')?.getSource();
    if (source) {
      this.drawManzana = new Draw({
        source: source,
        type: 'Polygon'  // Ajuste: Polygon para manzanas
      });
      this.drawManzana.on('drawend', this.manageDrawEnd);
      this.mapService.map.addInteraction(this.drawManzana);
    } else {
      console.error('Manzanas layer not found');
    }
  }

  enableDrawManzana() {
    this.mapService.disableMapInteractions();
    this.drawManzana!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawManzanaActivated', {}));
  }

  disableDrawManzana() {
    this.drawManzana!.setActive(false);
  }

  clearVectorLayer() {
    this.mapService.getLayerByTitle('Manzanas')?.getSource().clear();
  }

  reloadManzanasVectorLayer() {
    const layer = this.mapService.getLayerByTitle('Manzanas');
    if (layer) {
      layer.getSource()?.clear();
    }
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    // Ajuste: navega a manzanas-form
    this.router.navigate(['/manzanas-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    if (this.drawManzana) {
      this.mapService.map?.removeInteraction(this.drawManzana);
    }
  }
}