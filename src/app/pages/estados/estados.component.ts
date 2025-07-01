import { Component, OnInit } from '@angular/core';
import { EstadosService, Estado } from './estados.service';
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
  selector: 'app-estados',
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
  templateUrl: './estados.component.html',
  styleUrls: ['./estados.component.scss']
})
export class EstadosComponent implements OnInit {
  estados: Estado[] = [];
  selectedEstados: Estado[] = [];
  estado: Partial<Estado> = {};
  estadoDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;
  estadoAEliminar: Estado | null = null;

  constructor(
    private estadosService: EstadosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.estadosService.getAll().subscribe({
      next: data => {
        this.estados = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.estado = {};
    this.editId = null;
    this.submitted = false;
    this.estadoDialog = true;
  }

  editEstado(estado: Estado) {
    this.estado = { ...estado };
    this.editId = estado.id;
    this.estadoDialog = true;
    this.submitted = false;
  }

  saveEstado() {
    this.submitted = true;
    if (!this.estado.nombre) return;
    if (this.editId) {
      this.estadosService.update(this.editId, { nombre: this.estado.nombre }).subscribe(() => {
        this.estadoDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado correctamente' });
      });
    } else {
      this.estadosService.create({ nombre: this.estado.nombre! }).subscribe(() => {
        this.estadoDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado creado correctamente' });
      });
    }
  }

  deleteEstado(estado: Estado) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el estado "${estado.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.estadosService.delete(estado.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Estado eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedEstados() {
    if (!this.selectedEstados?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los estados seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedEstados.map(est => this.estadosService.delete(est.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedEstados = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Estados eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.estadoDialog = false;
    this.editId = null;
    this.estado = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedEstados = event;
  }
}
