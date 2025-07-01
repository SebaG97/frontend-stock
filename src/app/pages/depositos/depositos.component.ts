
import { Component, OnInit } from '@angular/core';
import { DepositosService, Deposito } from './depositos.service';
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
  selector: 'app-depositos',
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
  templateUrl: './depositos.component.html',
  styleUrls: ['./depositos.component.scss']
})
export class DepositosComponent implements OnInit {
  depositos: Deposito[] = [];
  selectedDepositos: Deposito[] = [];
  deposito: Partial<Deposito> = {};
  depositoDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private depositosService: DepositosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.depositosService.getAll().subscribe({
      next: data => {
        this.depositos = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.deposito = {};
    this.editId = null;
    this.submitted = false;
    this.depositoDialog = true;
  }

  editDeposito(deposito: Deposito) {
    this.deposito = { ...deposito };
    this.editId = deposito.id;
    this.depositoDialog = true;
    this.submitted = false;
  }

  saveDeposito() {
    this.submitted = true;
    if (!this.deposito.nombre) return;
    if (this.editId) {
      this.depositosService.update(this.editId, { nombre: this.deposito.nombre }).subscribe(() => {
        this.depositoDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Depósito actualizado correctamente' });
      });
    } else {
      this.depositosService.create({ nombre: this.deposito.nombre! }).subscribe(() => {
        this.depositoDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Depósito creado correctamente' });
      });
    }
  }

  deleteDeposito(deposito: Deposito) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el depósito "${deposito.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.depositosService.delete(deposito.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Depósito eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedDepositos() {
    if (!this.selectedDepositos?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los depósitos seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedDepositos.map(dep => this.depositosService.delete(dep.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedDepositos = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Depósitos eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.depositoDialog = false;
    this.editId = null;
    this.deposito = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedDepositos = event;
  }
}
