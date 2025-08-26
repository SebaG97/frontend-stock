import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { 
  ParteTrabajo, 
  FiltrosPartesTrabajo, 
  EstadoParteTrabajo,
  ResumenPartesTrabajo 
} from '../../models/partes-trabajo.model';
import { PartesTrabajoService } from '../../services/partes-trabajo.service';

@Component({
  selector: 'app-partes-trabajo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    TagModule,
    CalendarModule,
    ProgressSpinnerModule
  ],
  templateUrl: './partes-trabajo.component.html',
  styleUrls: ['./partes-trabajo.component.scss']
})
export class PartesTrabajoComponent implements OnInit {
  partesTrabajo: ParteTrabajo[] = [];
  partesTrabajoFiltradas: ParteTrabajo[] = [];
  resumen: ResumenPartesTrabajo | null = null;
  loading = false;
  error: string | null = null;

  // Filtros
  filtros: FiltrosPartesTrabajo = {
    skip: 0,
    limit: 100  // Aumentar para ver más registros
  };

  // Paginación
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  // Búsqueda
  searchQuery = '';

  // Estados disponibles
  estadosDisponibles: Array<{label: string, value: number}> = [];

  constructor(
    private partesTrabajoService: PartesTrabajoService,
    private router: Router
  ) {
    this.estadosDisponibles = this.partesTrabajoService.getEstadosDisponibles().map(estado => ({
      label: this.partesTrabajoService.formatearEstado(estado),
      value: estado
    }));
  }

  ngOnInit(): void {
    this.cargarPartesTrabajo();
  }

  cargarPartesTrabajo(): void {
    this.loading = true;
    this.error = null;

    this.partesTrabajoService.getPartesTrabajo(this.filtros).subscribe({
      next: (response) => {
        // Manejar tanto array directo como respuesta paginada
        if (Array.isArray(response)) {
          this.partesTrabajo = response;
          this.totalItems = response.length;
          this.totalPages = 1;
          this.currentPage = 1;
        } else {
          this.partesTrabajo = response.items || [];
          this.totalItems = response.total || 0;
          this.totalPages = response.pages || 0;
          this.currentPage = response.page || 1;
        }
        
        // Ordenar por número descendente (últimos primero)
        this.partesTrabajo.sort((a, b) => b.numero - a.numero);
        
        // Actualizar resumen con datos reales
        this.calcularResumen();
        
        // Aplicar filtros locales
        this.filtrarTabla();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las órdenes de trabajo';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  cargarResumen(): void {
    // Calcular resumen con datos locales
    this.calcularResumen();
  }

  calcularResumen(): void {
    if (this.partesTrabajo.length > 0) {
      const total = this.partesTrabajo.length;
      const finalizados = this.partesTrabajo.filter(p => p.estado === 3).length;
      
      this.resumen = {
        total_partes: total,
        partes_pendientes: this.partesTrabajo.filter(p => p.estado === 1).length,
        partes_en_proceso: this.partesTrabajo.filter(p => p.estado === 2).length,
        partes_finalizados: finalizados,
        partes_cancelados: this.partesTrabajo.filter(p => p.estado === 4).length,
        total_horas_trabajadas: 0,
        promedio_horas_por_parte: 0
      };
    }
  }

  filtrarTabla(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.partesTrabajoFiltradas = [...this.partesTrabajo];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.partesTrabajoFiltradas = this.partesTrabajo.filter(parte => 
        parte.trabajo_solicitado.toLowerCase().includes(query) ||
        (parte.cliente_empresa && parte.cliente_empresa.toLowerCase().includes(query)) ||
        parte.numero.toString().includes(query) ||
        parte.tecnicos.some(t => t.nombre.toLowerCase().includes(query))
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.filtrarTabla();
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.cargarPartesTrabajo();
  }

  cambiarPagina(page: number): void {
    if (page >= 1) {
      this.filtros.skip = (page - 1) * (this.filtros.limit || 100);
      this.cargarPartesTrabajo();
    }
  }

  verDetalle(parte: ParteTrabajo): void {
    if (!parte?.id) return;
    this.router.navigate(['/partes-trabajo', parte.id]);
  }

  editarParte(parte: ParteTrabajo): void {
    if (!parte?.id) return;
    this.router.navigate(['/partes-trabajo', parte.id, 'editar']);
  }

  cambiarEstado(parte: ParteTrabajo, nuevoEstado: number): void {
    const updateData: any = { estado: nuevoEstado };
    this.partesTrabajoService.updateParteTrabajo(parte.id, updateData).subscribe({
      next: (parteActualizada: ParteTrabajo) => {
        const index = this.partesTrabajo.findIndex(p => p.id === parte.id);
        if (index !== -1) {
          this.partesTrabajo[index] = parteActualizada;
        }
        this.calcularResumen(); // Actualizar resumen
        this.filtrarTabla(); // Actualizar tabla filtrada
      },
      error: (error: any) => {
        this.error = 'Error al cambiar el estado';
        console.error('Error:', error);
      }
    });
  }

  eliminarParte(parte: ParteTrabajo): void {
    if (confirm(`¿Está seguro de eliminar la orden de trabajo "${parte.trabajo_solicitado}"?`)) {
      this.partesTrabajoService.deleteParteTrabajo(parte.id).subscribe({
        next: () => {
          this.cargarPartesTrabajo();
        },
        error: (error: any) => {
          this.error = 'Error al eliminar la orden de trabajo';
          console.error('Error:', error);
        }
      });
    }
  }

  nuevaOrden(): void {
    this.router.navigate(['/partes-trabajo/nuevo']);
  }

  formatearEstado(estado: number): string {
    return this.partesTrabajoService.formatearEstado(estado);
  }

  getSeverityFromEstado(estado: number): string {
    switch (estado) {
      case 1: return 'warning';
      case 2: return 'info';
      case 3: return 'success';
      case 4: return 'danger';
      default: return 'secondary';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
