import { Component, OnInit } from '@angular/core';
import { ProductoLineasService, ProductoLinea } from './producto-lineas.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-producto-lineas',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './producto-lineas.component.html',
  styleUrls: ['./producto-lineas.component.scss']
})
export class ProductoLineasComponent implements OnInit {
  lineas: ProductoLinea[] = [];
  selectedLineas: ProductoLinea[] = [];
  linea: Partial<ProductoLinea> = {};
  lineaDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private lineasService: ProductoLineasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.lineasService.getAll().subscribe({
      next: data => {
        this.lineas = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.linea = {};
    this.editId = null;
    this.submitted = false;
    this.lineaDialog = true;
  }

  editLinea(linea: ProductoLinea) {
    this.linea = { ...linea };
    this.editId = linea.id;
    this.lineaDialog = true;
    this.submitted = false;
  }

  saveLinea() {
    this.submitted = true;
    if (!this.linea.nombre) return;
    if (this.editId) {
      this.lineasService.update(this.editId, { nombre: this.linea.nombre }).subscribe(() => {
        this.lineaDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Línea actualizada correctamente' });
      });
    } else {
      this.lineasService.create({ nombre: this.linea.nombre! }).subscribe(() => {
        this.lineaDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Línea creada correctamente' });
      });
    }
  }

  deleteLinea(linea: ProductoLinea) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la línea "${linea.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lineasService.delete(linea.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Línea eliminada correctamente' });
        });
      }
    });
  }

  deleteSelectedLineas() {
    if (!this.selectedLineas?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar las líneas seleccionadas?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedLineas.map(lin => this.lineasService.delete(lin.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedLineas = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminadas', detail: 'Líneas eliminadas correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.lineaDialog = false;
    this.editId = null;
    this.linea = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedLineas = event;
  }
}
