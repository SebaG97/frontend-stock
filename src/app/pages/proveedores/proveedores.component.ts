import { Component, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor } from './proveedores.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
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
    InputTextarea,
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
    
    // Validar campos obligatorios
    if (!this.proveedor.nombre || !this.proveedor.ruc) {
      return;
    }
    
    // Validar formato de RUC
    if (!this.validarRUC(this.proveedor.ruc)) {
      return;
    }
    
    // Validar email si está presente
    if (this.proveedor.email && !this.validarEmail(this.proveedor.email)) {
      return;
    }
    
    const proveedorData = {
      nombre: this.proveedor.nombre,
      ruc: this.proveedor.ruc,
      direccion: this.proveedor.direccion || undefined,
      telefono: this.proveedor.telefono || undefined,
      email: this.proveedor.email || undefined
    };
    
    if (this.editId) {
      this.proveedoresService.update(this.editId, proveedorData).subscribe({
        next: () => {
          this.proveedorDialog = false;
          this.editId = null;
          this.load();
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Proveedor actualizado correctamente' 
          });
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al actualizar el proveedor' 
          });
        }
      });
    } else {
      this.proveedoresService.create(proveedorData).subscribe({
        next: () => {
          this.proveedorDialog = false;
          this.load();
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Proveedor creado correctamente' 
          });
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al crear el proveedor' 
          });
        }
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

  /**
   * Manejar input del RUC con formato automático (Paraguay)
   * Acepta RUC personal (CI + dígito) y empresarial
   */
  onRUCInput(event: any) {
    let valor = event.target.value;
    
    // Remover caracteres no numéricos excepto guiones
    valor = valor.replace(/[^\d-]/g, '');
    
    // Remover guiones existentes para reformatear
    const soloNumeros = valor.replace(/-/g, '');
    
    // Aplicar formato automáticamente 
    // RUC Personal: 6-8 dígitos + verificador (ej: 4264123-3, 810002-0)
    // RUC Empresarial: 8 dígitos + verificador (ej: 12345678-9)
    if (soloNumeros.length >= 6) {
      // Encontrar la posición del último dígito (verificador)
      const digitosBase = soloNumeros.substring(0, soloNumeros.length - 1);
      const digitoVerificador = soloNumeros.substring(soloNumeros.length - 1);
      
      if (digitosBase.length >= 6 && digitoVerificador) {
        valor = digitosBase + '-' + digitoVerificador;
      } else {
        valor = soloNumeros;
      }
    } else {
      valor = soloNumeros;
    }
    
    // Limitar a 10 caracteres máximo (para RUC empresarial 12345678-9)
    if (valor.length > 10) {
      valor = valor.substring(0, 10);
    }
    
    // Actualizar el modelo y el input
    this.proveedor.ruc = valor;
    event.target.value = valor;
  }

  /**
   * Formatear RUC para mostrar en tabla
   */
  formatearRUC(ruc?: string): string {
    if (!ruc || ruc.trim() === '') return '-';
    return ruc;
  }

  /**
   * Validar formato de RUC (Paraguay)
   * Acepta RUC personal y empresarial
   * 
   * Ejemplos válidos:
   * - RUC Personal: 4264123-3, 810002-0 (CI + dígito verificador)
   * - RUC Empresarial: 12345678-9 (8 dígitos + verificador)
   */
  validarRUC(ruc?: string): boolean {
    if (!ruc || ruc.trim() === '') return false; // RUC es obligatorio ahora
    
    // Formato RUC Personal: 6-8 dígitos + guión + 1 dígito (ej: 4264123-3, 810002-0)
    // Formato RUC Empresarial: 8 dígitos + guión + 1 dígito (ej: 12345678-9)
    const rucParaguayPattern = /^\d{6,8}-\d{1}$/;
    
    if (!rucParaguayPattern.test(ruc)) return false;
    
    // Verificar que tenga entre 7 y 9 dígitos totales
    const soloNumeros = ruc.replace(/-/g, '');
    return soloNumeros.length >= 7 && soloNumeros.length <= 9;
  }

  /**
   * Validar formato de email
   */
  validarEmail(email?: string): boolean {
    if (!email || email.trim() === '') return true; // Email es opcional
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validar RUC del proveedor actual
   */
  esRucValido(): boolean {
    return this.validarRUC(this.proveedor.ruc);
  }

  /**
   * Validar email del proveedor actual
   */
  esEmailValido(): boolean {
    return this.validarEmail(this.proveedor.email);
  }
}
