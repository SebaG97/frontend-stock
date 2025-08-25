import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ParteTrabajo, EstadoParteTrabajo } from '../../../models/partes-trabajo.model';
import { PartesTrabajoService } from '../../../services/partes-trabajo.service';

@Component({
  selector: 'app-parte-trabajo-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parte-trabajo-detalle.component.html',
  styleUrls: ['./parte-trabajo-detalle.component.scss']
})
export class ParteTrabajoDetalleComponent implements OnInit {
  parte: ParteTrabajo | null = null;
  loading = false;
  error: string | null = null;
  estadosDisponibles: EstadoParteTrabajo[] = [];

  constructor(
    private partesTrabajoService: PartesTrabajoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.estadosDisponibles = this.partesTrabajoService.getEstadosDisponibles();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadParteTrabajo(id);
      }
    });
  }

  loadParteTrabajo(id: number): void {
    this.loading = true;
    this.error = null;

    this.partesTrabajoService.getParteTrabajo(id).subscribe({
      next: (parte) => {
        this.parte = parte;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la orden de trabajo';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  editarParte(): void {
    if (this.parte) {
      this.router.navigate(['/partes-trabajo', this.parte.id, 'editar']);
    }
  }

  cambiarEstado(nuevoEstado: EstadoParteTrabajo): void {
    if (!this.parte) return;

    this.partesTrabajoService.updateEstadoParteTrabajo(this.parte.id, nuevoEstado).subscribe({
      next: (parteActualizada) => {
        this.parte = parteActualizada;
      },
      error: (error) => {
        this.error = 'Error al cambiar el estado';
        console.error('Error:', error);
      }
    });
  }

  eliminarParte(): void {
    if (!this.parte) return;

    if (confirm(`¿Está seguro de eliminar la orden de trabajo "${this.parte.descripcion}"?`)) {
      this.partesTrabajoService.deleteParteTrabajo(this.parte.id).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error) => {
          this.error = 'Error al eliminar la orden de trabajo';
          console.error('Error:', error);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/partes-trabajo']);
  }

  formatearEstado(estado: EstadoParteTrabajo): string {
    return this.partesTrabajoService.formatearEstado(estado);
  }

  getClaseEstado(estado: EstadoParteTrabajo): string {
    return this.partesTrabajoService.getClaseEstado(estado);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  formatearHoras(horas?: number): string {
    return horas ? `${horas}h` : '0h';
  }

  get totalHoras(): number {
    if (!this.parte) return 0;
    const normales = this.parte.horas_normales || 0;
    const extrasNormales = this.parte.horas_extras_normales || 0;
    const extrasEspeciales = this.parte.horas_extras_especiales || 0;
    return normales + extrasNormales + extrasEspeciales;
  }

  get tieneHorasExtras(): boolean {
    if (!this.parte) return false;
    return (this.parte.horas_extras_normales || 0) > 0 || 
           (this.parte.horas_extras_especiales || 0) > 0;
  }

  get duracionTrabajo(): string {
    if (!this.parte || !this.parte.fecha_fin) return 'En progreso';
    
    const inicio = new Date(this.parte.fecha_inicio);
    const fin = new Date(this.parte.fecha_fin);
    const diferencia = fin.getTime() - inicio.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Mismo día';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  }
}
