import { Component, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor } from './proveedores.service';
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
  selector: 'app-proveedores',
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
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  selectedProveedores: Proveedor[] = [];
  proveedor: Partial<Proveedor> = {};
  proveedorDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private proveedoresService: ProveedoresService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.proveedoresService.getAll().subscribe({
      next: data => {
        this.proveedores = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.proveedor = {};
    this.editId = null;
    this.submitted = false;
    this.proveedorDialog = true;
  }

  editProveedor(proveedor: Proveedor) {
    this.proveedor = { ...proveedor };
    this.editId = proveedor.id;
    this.proveedorDialog = true;
    this.submitted = false;
  }

  saveProveedor() {
    this.submitted = true;
    if (!this.proveedor.nombre) return;
    if (this.editId) {
      this.proveedoresService.update(this.editId, { nombre: this.proveedor.nombre }).subscribe(() => {
        this.proveedorDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado correctamente' });
      });
    } else {
      this.proveedoresService.create({ nombre: this.proveedor.nombre! }).subscribe(() => {
        this.proveedorDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado correctamente' });
      });
    }
  }

  deleteProveedor(proveedor: Proveedor) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el proveedor "${proveedor.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.proveedoresService.delete(proveedor.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Proveedor eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedProveedores() {
    if (!this.selectedProveedores?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los proveedores seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedProveedores.map(prov => this.proveedoresService.delete(prov.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedProveedores = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Proveedores eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.proveedorDialog = false;
    this.editId = null;
    this.proveedor = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedProveedores = event;
  }
}
