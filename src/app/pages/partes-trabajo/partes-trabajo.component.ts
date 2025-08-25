import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule],
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
    page: 1,
    limit: 10
  };

  // Paginación
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  // Búsqueda
  searchQuery = '';

  // Estados disponibles
  estadosDisponibles: EstadoParteTrabajo[] = [];

  constructor(
    private partesTrabajoService: PartesTrabajoService,
    private router: Router
  ) {
    this.estadosDisponibles = this.partesTrabajoService.getEstadosDisponibles();
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
        this.partesTrabajo = response.items;
        this.totalItems = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.page;
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
    this.filtros.page = 1;
    this.cargarPartesTrabajo();
  }

  limpiarFiltros(): void {
    this.filtros = {
      page: 1,
      limit: 10
    };
    this.cargarPartesTrabajo();
  }

  buscar(): void {
    if (this.searchQuery.trim()) {
      this.partesTrabajoService.buscarPartesTrabajo(this.searchQuery).subscribe({
        next: (resultados) => {
          this.partesTrabajo = resultados;
          this.totalItems = resultados.length;
          this.totalPages = 1;
          this.currentPage = 1;
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
    if (page >= 1 && page <= this.totalPages) {
      this.filtros.page = page;
      this.cargarPartesTrabajo();
    }
  }

  verDetalle(id: number): void {
    this.router.navigate(['/partes-trabajo', id]);
  }

  editarParte(id: number): void {
    this.router.navigate(['/partes-trabajo', id, 'editar']);
  }

  cambiarEstado(parte: ParteTrabajo, nuevoEstado: EstadoParteTrabajo): void {
    this.partesTrabajoService.updateEstadoParteTrabajo(parte.id, nuevoEstado).subscribe({
      next: (parteActualizada) => {
        const index = this.partesTrabajo.findIndex(p => p.id === parte.id);
        if (index !== -1) {
          this.partesTrabajo[index] = parteActualizada;
        }
        this.cargarResumen(); // Actualizar resumen
      },
      error: (error) => {
        this.error = 'Error al cambiar el estado';
        console.error('Error:', error);
      }
    });
  }

  eliminarParte(parte: ParteTrabajo): void {
    if (confirm(`¿Está seguro de eliminar la orden de trabajo "${parte.descripcion}"?`)) {
      this.partesTrabajoService.deleteParteTrabajo(parte.id).subscribe({
        next: () => {
          this.cargarPartesTrabajo();
          this.cargarResumen();
        },
        error: (error) => {
          this.error = 'Error al eliminar la orden de trabajo';
          console.error('Error:', error);
        }
      });
    }
  }

  nuevaOrden(): void {
    this.router.navigate(['/partes-trabajo/nuevo']);
  }

  formatearEstado(estado: EstadoParteTrabajo): string {
    return this.partesTrabajoService.formatearEstado(estado);
  }

  getClaseEstado(estado: EstadoParteTrabajo): string {
    return this.partesTrabajoService.getClaseEstado(estado);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearHoras(horas?: number): string {
    return horas ? `${horas}h` : '0h';
  }
}
