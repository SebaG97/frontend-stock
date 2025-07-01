import { Component, OnInit } from '@angular/core';
import { RubrosService, Rubro } from './rubros.service';
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
  selector: 'app-rubros',
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
  templateUrl: './rubros.component.html',
  styleUrls: ['./rubros.component.scss']
})
export class RubrosComponent implements OnInit {
  rubros: Rubro[] = [];
  selectedRubros: Rubro[] = [];
  rubro: Partial<Rubro> = {};
  rubroDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private rubrosService: RubrosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.rubrosService.getAll().subscribe({
      next: data => {
        this.rubros = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.rubro = {};
    this.editId = null;
    this.submitted = false;
    this.rubroDialog = true;
  }

  editRubro(rubro: Rubro) {
    this.rubro = { ...rubro };
    this.editId = rubro.id;
    this.rubroDialog = true;
    this.submitted = false;
  }

  saveRubro() {
    this.submitted = true;
    if (!this.rubro.nombre) return;
    if (this.editId) {
      this.rubrosService.update(this.editId, { nombre: this.rubro.nombre }).subscribe(() => {
        this.rubroDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rubro actualizado correctamente' });
      });
    } else {
      this.rubrosService.create({ nombre: this.rubro.nombre! }).subscribe(() => {
        this.rubroDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rubro creado correctamente' });
      });
    }
  }

  deleteRubro(rubro: Rubro) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el rubro "${rubro.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.rubrosService.delete(rubro.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Rubro eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedRubros() {
    if (!this.selectedRubros?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los rubros seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedRubros.map(rub => this.rubrosService.delete(rub.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedRubros = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Rubros eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.rubroDialog = false;
    this.editId = null;
    this.rubro = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedRubros = event;
  }
}
