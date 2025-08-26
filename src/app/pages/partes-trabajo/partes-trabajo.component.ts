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
    this.cargarResumen();
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
    this.partesTrabajoService.getResumenStats().subscribe({
      next: (resumen) => {
        this.resumen = resumen;
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.filtros.skip = 0;
    this.cargarPartesTrabajo();
  }

  limpiarFiltros(): void {
    this.filtros = {
      skip: 0,
      limit: 100
    };
    this.cargarPartesTrabajo();
  }

  buscar(): void {
    if (this.searchQuery.trim()) {
      this.partesTrabajoService.buscarPartesTrabajo(this.searchQuery).subscribe({
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
        },
        error: (error) => {
          this.error = 'Error en la búsqueda';
          console.error('Error:', error);
        }
      });
    } else {
      this.cargarPartesTrabajo();
    }
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
        this.cargarResumen(); // Actualizar resumen
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
          this.cargarResumen();
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

  getClaseEstado(estado: number): string {
    return this.partesTrabajoService.getClaseEstado(estado);
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
    return this.partesTrabajoService.formatearFecha(fecha);
  }

  formatearHoras(horas?: number): string {
    return horas ? `${horas}h` : '0h';
  }
}
