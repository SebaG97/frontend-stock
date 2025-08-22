import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { HorasExtrasService, ResumenHorasExtras, ReporteHorasExtras, Tecnico, DetalleHorasExtras, ParteConHorasExtras } from '../../services/horas-extras.service';

@Component({
  selector: 'app-horas-extras',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule,
    DropdownModule, TagModule, ToastModule, DialogModule,
    ProgressSpinnerModule, TooltipModule
  ],
  templateUrl: './horas-extras.component.html',
  styleUrls: ['./horas-extras.component.scss'],
  providers: [MessageService]
})
export class HorasExtrasComponent implements OnInit {
  reporte: ReporteHorasExtras | null = null;
  tecnicos: Tecnico[] = [];
  loading = false;
  sincronizando = false;

  // Filtros - inicializados con valores por defecto
  fechaInicioString = '';
  fechaFinString = '';
  
  get fechaInicio(): Date | null {
    return this.fechaInicioString ? new Date(this.fechaInicioString) : null;
  }
  
  get fechaFin(): Date | null {
    return this.fechaFinString ? new Date(this.fechaFinString) : null;
  }
  
  tecnicoSeleccionado: Tecnico | null = null;

  // Modal de detalle
  mostrarDetalle = false;
  detalleSeleccionado: DetalleHorasExtras | null = null;
  loadingDetalle = false;

  // Modal de partes de trabajo
  mostrarPartes = false;
  partesSeleccionadas: ParteConHorasExtras[] = [];
  tecnicoPartesSeleccionado: string = '';
  loadingPartes = false;

  constructor(
    private horasExtrasService: HorasExtrasService,
    private messageService: MessageService
  ) {
    // Inicializar fechas por defecto (del 21 del mes pasado al 20 del mes actual)
    this.inicializarPeriodoActual();
  }

  private inicializarPeriodoActual() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Fecha inicio: día 21 del mes anterior
    const fechaInicio = new Date(añoActual, mesActual - 1, 21);
    
    // Fecha fin: día 20 del mes actual
    const fechaFin = new Date(añoActual, mesActual, 20);
    
    this.fechaInicioString = fechaInicio.toISOString().split('T')[0];
    this.fechaFinString = fechaFin.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarTecnicos();
    this.cargarReporte();
  }

  cargarTecnicos() {
    this.horasExtrasService.getTecnicos().subscribe({
      next: (tecnicos) => {
        // Procesar técnicos para añadir nombre_completo
        this.tecnicos = tecnicos.map(tecnico => ({
          ...tecnico,
          nombre_completo: `${tecnico.nombre || ''} ${tecnico.apellido || ''}`.trim()
        }));
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar lista de técnicos'
        });
      }
    });
  }

  cargarReporte() {
    this.loading = true;
    
    // Solo enviar fechas si están definidas y no son strings vacíos
    const fechaInicio = (this.fechaInicio && this.fechaInicioString.trim()) ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = (this.fechaFin && this.fechaFinString.trim()) ? this.formatDate(this.fechaFin) : undefined;
    const tecnicoId = this.tecnicoSeleccionado?.id;

    this.horasExtrasService.getReporte(fechaInicio, fechaFin, tecnicoId).subscribe({
      next: (reporte) => {
        this.reporte = reporte;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte cargado: ${reporte.resumen.length} técnicos encontrados`
        });
      },
      error: (error) => {
        console.error('Error cargando reporte:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el reporte de horas extras'
        });
      }
    });
  }

  sincronizar() {
    this.sincronizando = true;
    this.horasExtrasService.sincronizarPartes().subscribe({
      next: (response) => {
        this.sincronizando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sincronización completada correctamente'
        });
        this.cargarReporte(); // Recargar datos después de sincronizar
      },
      error: (error) => {
        console.error('Error en sincronización:', error);
        this.sincronizando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error durante la sincronización'
        });
      }
    });
  }

  verDetalle(resumen: ResumenHorasExtras) {
    this.loadingDetalle = true;
    this.mostrarDetalle = true;
    this.detalleSeleccionado = null;
    
    const fechaInicio = this.fechaInicio ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = this.fechaFin ? this.formatDate(this.fechaFin) : undefined;

    this.horasExtrasService.getDetalleTecnico(resumen.tecnico_id, fechaInicio, fechaFin).subscribe({
      next: (detalle) => {
        this.detalleSeleccionado = detalle;
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('Error cargando detalle:', error);
        this.loadingDetalle = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el detalle del técnico'
        });
        this.mostrarDetalle = false;
      }
    });
  }

  verPartesTrabajo(resumen: ResumenHorasExtras) {
    this.loadingPartes = true;
    this.mostrarPartes = true;
    this.partesSeleccionadas = [];
    this.tecnicoPartesSeleccionado = `${resumen.tecnico_nombre} ${resumen.tecnico_apellido}`;
    
    const fechaInicio = this.fechaInicio ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = this.fechaFin ? this.formatDate(this.fechaFin) : undefined;

    this.horasExtrasService.getPartesConHorasExtras({
      tecnico_id: resumen.tecnico_id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }).subscribe({
      next: (partes) => {
        this.partesSeleccionadas = partes;
        this.loadingPartes = false;
      },
      error: (error) => {
        console.error('Error cargando partes:', error);
        this.loadingPartes = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las partes de trabajo'
        });
        this.mostrarPartes = false;
      }
    });
  }

  limpiarFiltros() {
    // Establecer un rango muy amplio para ver todos los datos
    // Desde hace 2 años hasta dentro de 1 año
    const hoy = new Date();
    const fechaInicioAmplia = new Date(hoy.getFullYear() - 2, 0, 1); // 1 enero hace 2 años
    const fechaFinAmplia = new Date(hoy.getFullYear() + 1, 11, 31); // 31 diciembre del próximo año
    
    this.fechaInicioString = fechaInicioAmplia.toISOString().split('T')[0];
    this.fechaFinString = fechaFinAmplia.toISOString().split('T')[0];
    this.tecnicoSeleccionado = null;
    this.cargarReporte();
  }

  verTodosLosDatos() {
    // Solo quitar filtros de fecha, mantener técnico seleccionado si hay
    this.fechaInicioString = '';
    this.fechaFinString = '';
    this.cargarReporte();
  }

  aplicarPeriodoActual() {
    // Solo cambiar fechas al período actual, mantener técnico seleccionado si hay
    this.inicializarPeriodoActual();
    this.cargarReporte();
  }

  limpiarTodo() {
    // Limpiar completamente todos los filtros
    this.fechaInicioString = '';
    this.fechaFinString = '';
    this.tecnicoSeleccionado = null;
    this.cargarReporte();
  }

  exportarDatos() {
    // TODO: Implementar exportación a Excel/CSV
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad de exportación en desarrollo'
    });
  }

  // Métodos auxiliares para las partes de trabajo
  getTotalHorasPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => total + parte.horas_trabajadas, 0);
  }

  getTotalHorasExtrasPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => 
      total + parte.horas_extras_normales + parte.horas_extras_especiales, 0);
  }

  getTotalHorasNormalesPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => total + parte.horas_normales, 0);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTotalHorasExtrasNormales(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_extras_normales, 0) || 0;
  }

  getTotalHorasExtrasEspeciales(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_extras_especiales, 0) || 0;
  }

  getTotalHorasTrabajadas(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_trabajadas, 0) || 0;
  }

  getTotalPartes(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.partes_trabajados, 0) || 0;
  }

  getSeverityForHorasExtras(horas: number): string {
    if (horas === 0) return 'secondary';
    if (horas <= 10) return 'info';
    if (horas <= 20) return 'warning';
    return 'danger';
  }

  getTecnicoNombreCompleto(tecnico: Tecnico | null | undefined): string {
    if (!tecnico) return '';
    return tecnico.nombre_completo || `${tecnico.nombre || ''} ${tecnico.apellido || ''}`.trim();
  }
}
