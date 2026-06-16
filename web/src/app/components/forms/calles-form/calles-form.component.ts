import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { CalleModel } from '../../../models/calle.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-calles-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './calles-form.component.html',
  styleUrl: './calles-form.component.scss'
})
export class CallesFormComponent implements OnInit {
  l: CalleModel[] = [];
  serverMessage = '';
  geomInUrl = false; 

  id = new FormControl('');
  nombre = new FormControl('', [Validators.required]);
  longitud = new FormControl('', [Validators.required]);
  estado = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    nombre: this.nombre,
    longitud: this.longitud,
    estado: this.estado,
    geom: this.geom
  });

  // constructor(private apiService: ApiService) {}
  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, public router: Router) {}

  // ngOnInit(): void {
  //   this.selectAll();
  // }

  ngOnInit(): void {
  this.selectAll();
  this.activatedRoute.queryParamMap.subscribe(params => {
    var geom = params.get("geom");
    if (geom) {
      this.geom.setValue(geom);
      this.geomInUrl = true;
    }
  });
  }
  
  insert() {
    this.serverMessage = '';
    this.apiService.post('p1/calles/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.serverMessage = 'Calle insertada correctamente';
        this.selectAll();
      },
      error: error => {
        console.log(error);
        this.serverMessage = 'Error al insertar';
      }
    });
  }

  select() {
    this.serverMessage = '';
    if (!this.id.value) {
      this.serverMessage = 'Introduce un id';
      return;
    }
    this.apiService.get('p1/calles/' + this.id.value + '/').subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.setDataInForm(response);
        this.clearList();
      },
      error: error => {
        console.log(error);
        this.serverMessage = 'Error al seleccionar';
      }
    });
  }

  selectAll() {
    this.serverMessage = '';
    this.apiService.get('p1/calles/').subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.l = response as CalleModel[];
        this.serverMessage = 'Calles cargadas';
      },
      error: error => {
        console.log(error);
        this.serverMessage = 'Error al cargar calles';
      }
    });
  }

  update() {
    this.serverMessage = '';
    if (!this.id.value) {
      this.serverMessage = 'Introduce un id';
      return;
    }
    this.apiService.patch('p1/calles/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.serverMessage = 'Calle actualizada correctamente';
        this.selectAll();
      },
      error: error => {
        console.log(error);
        this.serverMessage = 'Error al actualizar';
      }
    });
  }

  deleteRow() {
  this.serverMessage = '';
  if (!this.id.value) {
    this.serverMessage = 'Introduce un id';
    return;
  }
  this.apiService.delete('p1/calles/' + this.id.value + '/').subscribe({
    next: (response: any) => {
      console.log('response', response);
      this.clearForm();
      this.selectAll();
      this.serverMessage = 'Calle eliminada correctamente';
    },
    error: error => {
      console.log(error);
      this.serverMessage = 'Error al eliminar';
      }
    });
  }

  clearForm() {
    this.controlsGroup.reset();
  }

  clearList() {
    this.l = [];
  }

  setDataInForm(data: CalleModel) {
    this.id.setValue(data.id.toString());
    this.nombre.setValue(data.nombre);
    this.longitud.setValue(data.longitud.toString());
    this.estado.setValue(data.estado);
    this.geom.setValue(data.geom_wkt);
  }

  useGeomInUrl() {
  this.activatedRoute.queryParamMap.subscribe(params => {
    this.geom.setValue(params.get("geom"));
  });
}
}

