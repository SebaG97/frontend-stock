import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';

import { MessageService, ConfirmationService } from 'primeng/api';

import { CajaChicaService } from '../../services/caja-chica.service';
import { 
  GastoResumen,
  ResponseGastos,
  FiltrosGastos,
  Proveedor
} from '../../models/caja-chica.model';

/**
 * 📋 Componente para listar y gestionar gastos de Caja Chica
 * 
 * Features:
 * - Lista paginada con filtros
 * - Búsqueda por múltiples criterios  
 * - Acciones CRUD (Ver, Editar, Eliminar)
 * - Exportación y reportes
 */
@Component({
  selector: 'app-gastos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    ToolbarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gastos-list.component.html',
  styleUrls: ['./gastos-list.component.scss']
})
export class GastosListComponent implements OnInit {
  // 📊 Datos principales
  gastos: GastoResumen[] = [];
  gastosSeleccionados: GastoResumen[] = [];
  proveedores: Proveedor[] = [];
  
  // 📄 Paginación
  totalRecords = 0;
  loading = true;
  first = 0;
  rows = 10;
  
  // 🔍 Filtros
  filtros: FiltrosGastos = {
    skip: 0,
    limit: 10
  };
  
  // 📅 Opciones para dropdowns
  opcionesMeses: { value: number; label: string }[] = [];
  opcionesAnios: number[] = [];
  
  // 📝 Búsqueda
  textoBusqueda = '';
  proveedorSeleccionado: Proveedor | null = null;
  mesSeleccionado: number | null = null;
  anioSeleccionado: number | null = null;
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  constructor(
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    // Inicializar con mes/año actuales
    const hoy = new Date();
    this.mesSeleccionado = hoy.getMonth() + 1;
    this.anioSeleccionado = hoy.getFullYear();
    
    this.filtros.mes = this.mesSeleccionado;
    this.filtros.año = this.anioSeleccionado;
  }

  ngOnInit() {
    // Inicializar opciones
    this.opcionesMeses = this.cajaChicaService.obtenerMesesAño();
    this.opcionesAnios = this.cajaChicaService.obtenerAñosDisponibles();
    
    this.cargarProveedores();
    this.cargarGastos();
  }

  // ===============================================
  // 📊 CARGA DE DATOS
  // ===============================================

  cargarGastos() {
    this.loading = true;
    
    this.cajaChicaService.listarGastos(this.filtros).subscribe({
      next: (response: ResponseGastos) => {
        this.gastos = response.gastos;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar gastos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los gastos'
        });
        this.loading = false;
      }
    });
  }

  cargarProveedores() {
    this.cajaChicaService.obtenerProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  // ===============================================
  // 🔍 FILTROS Y BÚSQUEDA
  // ===============================================

  aplicarFiltros() {
    // Resetear paginación
    this.first = 0;
    this.filtros.skip = 0;
    
    // Aplicar filtros actuales
    this.filtros.mes = this.mesSeleccionado || undefined;
    this.filtros.año = this.anioSeleccionado || undefined;
    this.filtros.proveedor_id = this.proveedorSeleccionado?.id || undefined;
    this.filtros.descripcion = this.textoBusqueda || undefined;
    
    // Fechas
    if (this.fechaDesde) {
      this.filtros.fecha_desde = this.cajaChicaService.formatearFechaApi(this.fechaDesde);
    }
    if (this.fechaHasta) {
      this.filtros.fecha_hasta = this.cajaChicaService.formatearFechaApi(this.fechaHasta);
    }
    
    this.cargarGastos();
  }

  limpiarFiltros() {
    // Resetear todos los filtros
    const hoy = new Date();
    this.mesSeleccionado = hoy.getMonth() + 1;
    this.anioSeleccionado = hoy.getFullYear();
    this.proveedorSeleccionado = null;
    this.textoBusqueda = '';
    this.fechaDesde = null;
    this.fechaHasta = null;
    
    this.filtros = {
      mes: this.mesSeleccionado,
      año: this.anioSeleccionado,
      skip: 0,
      limit: this.rows
    };
    
    this.first = 0;
    this.cargarGastos();
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se mostraran los gastos del mes actual'
    });
  }

  buscarGastos(event: any) {
    const query = event.target.value;
    if (query.length >= 3 || query.length === 0) {
      this.textoBusqueda = query;
      this.aplicarFiltros();
    }
  }

  // ===============================================
  // 📄 PAGINACIÓN
  // ===============================================

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.filtros.skip = event.first;
    this.filtros.limit = event.rows;
    
    this.cargarGastos();
  }

  // ===============================================
  // 🧭 NAVEGACIÓN Y ACCIONES
  // ===============================================

  irANuevoGasto() {
    this.router.navigate(['/caja-chica/nuevo-gasto']);
  }

  verDetalleGasto(gasto: GastoResumen) {
    this.router.navigate(['/caja-chica/gastos', gasto.id]);
  }

  editarGasto(gasto: GastoResumen) {
    this.router.navigate(['/caja-chica/gastos', gasto.id, 'editar']);
  }

  eliminarGasto(gasto: GastoResumen) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el gasto de factura "${gasto.numero_factura}"?<br><br>
                <strong>Esta acción:</strong><br>
                • Eliminará el gasto permanentemente<br>
                • Revertirá el stock de los productos<br>
                • No se puede deshacer`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cajaChicaService.eliminarGasto(gasto.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gasto eliminado',
              detail: 'El gasto se eliminó correctamente y se revirtió el stock'
            });
            this.cargarGastos();
          },
          error: (error) => {
            console.error('Error al eliminar gasto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el gasto'
            });
          }
        });
      }
    });
  }

  eliminarGastosSeleccionados() {
    if (this.gastosSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un gasto para eliminar'
      });
      return;
    }

    const cantidad = this.gastosSeleccionados.length;
    
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar ${cantidad} gasto(s) seleccionado(s)?<br><br>
                <strong>Esta acción:</strong><br>
                • Eliminará los gastos permanentemente<br>
                • Revertirá el stock de todos los productos<br>
                • No se puede deshacer`,
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // TODO: Implementar eliminación múltiple en el backend
        // Por ahora eliminar uno por uno
        let eliminados = 0;
        
        this.gastosSeleccionados.forEach(gasto => {
          this.cajaChicaService.eliminarGasto(gasto.id).subscribe({
            next: () => {
              eliminados++;
              if (eliminados === cantidad) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Gastos eliminados',
                  detail: `Se eliminaron ${cantidad} gasto(s) correctamente`
                });
                this.cargarGastos();
                this.gastosSeleccionados = [];
              }
            },
            error: (error) => {
              console.error('Error al eliminar gasto:', error);
            }
          });
        });
      }
    });
  }

  // ===============================================
  // 🎨 UTILIDADES DE FORMATO
  // ===============================================

  formatearMoneda(valor: number): string {
    return this.cajaChicaService.formatearMoneda(valor);
  }

  formatearFecha(fecha: string): string {
    return this.cajaChicaService.formatearFechaMostrar(fecha);
  }

  obtenerSeveridadMonto(monto: number): string {
    if (monto >= 10000) return 'danger';
    if (monto >= 5000) return 'warning';
    if (monto >= 1000) return 'info';
    return 'success';
  }

  // ===============================================
  // 📊 EXPORTACIÓN Y REPORTES
  // ===============================================

  exportarExcel() {
    // TODO: Implementar exportación a Excel
    this.messageService.add({
      severity: 'info',
      summary: 'Función pendiente',
      detail: 'La exportación a Excel estará disponible próximamente'
    });
  }

  exportarPDF() {
    // TODO: Implementar exportación a PDF
    this.messageService.add({
      severity: 'info',
      summary: 'Función pendiente',
      detail: 'La exportación a PDF estará disponible próximamente'
    });
  }

  // ===============================================
  // 🔄 ACTUALIZACIÓN
  // ===============================================

  refrescarDatos() {
    this.cargarGastos();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Lista de gastos actualizada'
    });
  }
}