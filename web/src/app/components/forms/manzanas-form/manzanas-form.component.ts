// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-manzanas-form',
//   standalone: true,
//   imports: [],
//   templateUrl: './manzanas-form.component.html',
//   styleUrl: './manzanas-form.component.scss'
// })
// export class ManzanasFormComponent {

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
import { ManzanaModel } from '../../../models/manzana.model';

@Component({
  selector: 'app-manzanas-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, MatCardModule],
  templateUrl: './manzanas-form.component.html',
  styleUrl: './manzanas-form.component.scss'
})
export class ManzanasFormComponent implements OnInit {
  l: ManzanaModel[] = [];
  serverMessage = '';

  id = new FormControl('');
  nombre = new FormControl('', [Validators.required]);
  area = new FormControl('', [Validators.required]);
  descripcion = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  controlsGroup = new FormGroup({
    id: this.id,
    nombre: this.nombre,
    area: this.area,
    descripcion: this.descripcion,
    geom: this.geom
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.selectAll();
  }

  insert() {
    this.serverMessage = '';
    this.apiService.post('p1/manzanas/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        this.serverMessage = 'Manzana insertada correctamente';
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
    this.apiService.get('p1/manzanas/' + this.id.value + '/').subscribe({
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
    this.apiService.get('p1/manzanas/').subscribe({
      next: (response: any) => {
        this.l = response as ManzanaModel[];
        this.serverMessage = 'Manzanas cargadas';
      },
      error: error => {
        this.serverMessage = 'Error al cargar manzanas';
      }
    });
  }

  update() {
    this.serverMessage = '';
    if (!this.id.value) {
      this.serverMessage = 'Introduce un id';
      return;
    }
    this.apiService.patch('p1/manzanas/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        this.serverMessage = 'Manzana actualizada correctamente';
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
    this.apiService.delete('p1/manzanas/' + this.id.value + '/').subscribe({
      next: (response: any) => {
        this.clearForm();
        this.selectAll();
        this.serverMessage = 'Manzana eliminada correctamente';
      },
      error: error => {
        this.serverMessage = 'Error al eliminar';
      }
    });
  }

  clearForm() { this.controlsGroup.reset(); }
  clearList() { this.l = []; }

  setDataInForm(data: ManzanaModel) {
    this.id.setValue(data.id.toString());
    this.nombre.setValue(data.nombre);
    this.area.setValue(data.area.toString());
    this.descripcion.setValue(data.descripcion);
    this.geom.setValue(data.geom_wkt);
  }
}