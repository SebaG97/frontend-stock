import { Component, OnInit } from '@angular/core';
import { ProcedenciasService, Procedencia } from './procedencias.service';
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
  selector: 'app-procedencias',
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
  templateUrl: './procedencias.component.html',
  styleUrls: ['./procedencias.component.scss']
})
export class ProcedenciasComponent implements OnInit {
  procedencias: Procedencia[] = [];
  selectedProcedencias: Procedencia[] = [];
  procedencia: Partial<Procedencia> = {};
  procedenciaDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private procedenciasService: ProcedenciasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.procedenciasService.getAll().subscribe({
      next: data => {
        this.procedencias = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.procedencia = {};
    this.editId = null;
    this.submitted = false;
    this.procedenciaDialog = true;
  }

  editProcedencia(procedencia: Procedencia) {
    this.procedencia = { ...procedencia };
    this.editId = procedencia.id;
    this.procedenciaDialog = true;
    this.submitted = false;
  }

  saveProcedencia() {
    this.submitted = true;
    if (!this.procedencia.nombre) return;
    if (this.editId) {
      this.procedenciasService.update(this.editId, { nombre: this.procedencia.nombre }).subscribe(() => {
        this.procedenciaDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Procedencia actualizada correctamente' });
      });
    } else {
      this.procedenciasService.create({ nombre: this.procedencia.nombre! }).subscribe(() => {
        this.procedenciaDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Procedencia creada correctamente' });
      });
    }
  }

  deleteProcedencia(procedencia: Procedencia) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la procedencia "${procedencia.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.procedenciasService.delete(procedencia.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Procedencia eliminada correctamente' });
        });
      }
    });
  }

  deleteSelectedProcedencias() {
    if (!this.selectedProcedencias?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar las procedencias seleccionadas?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedProcedencias.map(proc => this.procedenciasService.delete(proc.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedProcedencias = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminadas', detail: 'Procedencias eliminadas correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.procedenciaDialog = false;
    this.editId = null;
    this.procedencia = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedProcedencias = event;
  }
}
