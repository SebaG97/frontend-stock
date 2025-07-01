import { Component, OnInit } from '@angular/core';
import { MarcasService, Marca } from './marcas.service';
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
  selector: 'app-marcas',
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
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss']
})
export class MarcasComponent implements OnInit {
  marcas: Marca[] = [];
  selectedMarcas: Marca[] = [];
  marca: Partial<Marca> = {};
  marcaDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  constructor(
    private marcasService: MarcasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.marcasService.getAll().subscribe({
      next: data => {
        this.marcas = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.marca = {};
    this.editId = null;
    this.submitted = false;
    this.marcaDialog = true;
  }

  editMarca(marca: Marca) {
    this.marca = { ...marca };
    this.editId = marca.id;
    this.marcaDialog = true;
    this.submitted = false;
  }

  saveMarca() {
    this.submitted = true;
    if (!this.marca.nombre) return;
    if (this.editId) {
      this.marcasService.update(this.editId, { nombre: this.marca.nombre }).subscribe(() => {
        this.marcaDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca actualizada correctamente' });
      });
    } else {
      this.marcasService.create({ nombre: this.marca.nombre! }).subscribe(() => {
        this.marcaDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca creada correctamente' });
      });
    }
  }

  deleteMarca(marca: Marca) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la marca "${marca.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marcasService.delete(marca.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Marca eliminada correctamente' });
        });
      }
    });
  }

  deleteSelectedMarcas() {
    if (!this.selectedMarcas?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar las marcas seleccionadas?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedMarcas.map(mar => this.marcasService.delete(mar.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedMarcas = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminadas', detail: 'Marcas eliminadas correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.marcaDialog = false;
    this.editId = null;
    this.marca = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedMarcas = event;
  }
}
