import { Component, OnInit } from '@angular/core';
import { TiposProductoService, TipoProducto } from './tipos-producto.service';
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
  selector: 'app-tipos-producto',
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
  templateUrl: './tipos-producto.component.html',
  styleUrls: ['./tipos-producto.component.scss']
})
export class TiposProductoComponent implements OnInit {
  tipos: TipoProducto[] = [];
  selectedTipos: TipoProducto[] = [];
  tipo: Partial<TipoProducto> = {};
  tipoDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private tiposService: TiposProductoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.tiposService.getAll().subscribe({
      next: data => {
        this.tipos = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.tipo = {};
    this.editId = null;
    this.submitted = false;
    this.tipoDialog = true;
  }

  editTipo(tipo: TipoProducto) {
    this.tipo = { ...tipo };
    this.editId = tipo.id;
    this.tipoDialog = true;
    this.submitted = false;
  }

  saveTipo() {
    this.submitted = true;
    if (!this.tipo.nombre) return;
    if (this.editId) {
      this.tiposService.update(this.editId, { nombre: this.tipo.nombre }).subscribe(() => {
        this.tipoDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo actualizado correctamente' });
      });
    } else {
      this.tiposService.create({ nombre: this.tipo.nombre! }).subscribe(() => {
        this.tipoDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo creado correctamente' });
      });
    }
  }

  deleteTipo(tipo: TipoProducto) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el tipo "${tipo.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tiposService.delete(tipo.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Tipo eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedTipos() {
    if (!this.selectedTipos?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los tipos seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedTipos.map(tip => this.tiposService.delete(tip.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedTipos = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Tipos eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.tipoDialog = false;
    this.editId = null;
    this.tipo = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedTipos = event;
  }
}
