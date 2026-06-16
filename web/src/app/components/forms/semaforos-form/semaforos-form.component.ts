// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-semaforos-form',
//   standalone: true,
//   imports: [],
//   templateUrl: './semaforos-form.component.html',
//   styleUrl: './semaforos-form.component.scss'
// })
// export class SemaforosFormComponent {

// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { SemaforoModel } from '../../../models/semaforo.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-semaforos-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './semaforos-form.component.html',
  styleUrl: './semaforos-form.component.scss'
})
export class SemaforosFormComponent implements OnInit {
  l: SemaforoModel[] = [];
  serverMessage = '';
  geomInUrl = false;

  id = new FormControl('');
  nombre = new FormControl('', [Validators.required]);
  estado = new FormControl('', [Validators.required]);
  tipo = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    nombre: this.nombre,
    estado: this.estado,
    tipo: this.tipo,
    geom: this.geom
  });

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, public router: Router) {}

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
    this.apiService.post('p1/semaforos/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        this.serverMessage = 'Semáforo insertado correctamente';
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
    this.apiService.get('p1/semaforos/' + this.id.value + '/').subscribe({
      next: (response: any) => {
        this.setDataInForm(response);
        this.clearList();
      },
      error: error => {
        this.serverMessage = 'Error al seleccionar';
      }
    });
  }

  selectAll() {
    this.serverMessage = '';
    this.apiService.get('p1/semaforos/').subscribe({
      next: (response: any) => {
        this.l = response as SemaforoModel[];
        this.serverMessage = 'Semáforos cargados';
      },
      error: error => {
        this.serverMessage = 'Error al cargar semáforos';
      }
    });
  }

  update() {
    this.serverMessage = '';
    if (!this.id.value) {
      this.serverMessage = 'Introduce un id';
      return;
    }
    this.apiService.patch('p1/semaforos/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        this.serverMessage = 'Semáforo actualizado correctamente';
        this.selectAll();
      },
      error: error => {
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
    this.apiService.delete('p1/semaforos/' + this.id.value + '/').subscribe({
      next: (response: any) => {
        this.clearForm();
        this.selectAll();
        this.serverMessage = 'Semáforo eliminado correctamente';
      },
      error: error => {
        this.serverMessage = 'Error al eliminar';
      }
    });
  }

  clearForm() { this.controlsGroup.reset(); }
  clearList() { this.l = []; }

  setDataInForm(data: SemaforoModel) {
    this.id.setValue(data.id.toString());
    this.nombre.setValue(data.nombre);
    this.estado.setValue(data.estado);
    this.tipo.setValue(data.tipo);
    this.geom.setValue(data.geom_wkt);
  }

  useGeomInUrl() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.geom.setValue(params.get("geom"));
    });
  }
}