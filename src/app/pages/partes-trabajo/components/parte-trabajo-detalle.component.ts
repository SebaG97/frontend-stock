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
  estadosDisponibles: Array<{label: string, value: number}> = [];

  constructor(
    private partesTrabajoService: PartesTrabajoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.estadosDisponibles = this.partesTrabajoService.getEstadosDisponibles().map(estado => ({
      label: this.partesTrabajoService.formatearEstado(estado),
      value: estado
    }));
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

    this.partesTrabajoService.getParteTrabajoById(id).subscribe({
      next: (parte: ParteTrabajo) => {
        this.parte = parte;
        this.loading = false;
      },
      error: (error: any) => {
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

  cambiarEstado(nuevoEstado: number): void {
    if (!this.parte) return;

    const updateData: any = { estado: nuevoEstado };
    this.partesTrabajoService.updateParteTrabajo(this.parte.id, updateData).subscribe({
      next: (parteActualizada: ParteTrabajo) => {
        this.parte = parteActualizada;
      },
      error: (error: any) => {
        this.error = 'Error al cambiar el estado';
        console.error('Error:', error);
      }
    });
  }

  eliminarParte(): void {
    if (!this.parte) return;

    if (confirm(`¿Está seguro de eliminar la orden de trabajo "${this.parte.trabajo_solicitado}"?`)) {
      this.partesTrabajoService.deleteParteTrabajo(this.parte.id).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error: any) => {
          this.error = 'Error al eliminar la orden de trabajo';
          console.error('Error:', error);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/partes-trabajo']);
  }

  formatearEstado(estado: number): string {
    return this.partesTrabajoService.formatearEstado(estado);
  }

  getClaseEstado(estado: number): string {
    return this.partesTrabajoService.getClaseEstado(estado);
  }

  formatearFecha(fecha: string): string {
    return this.partesTrabajoService.formatearFecha(fecha);
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  formatearHoras(horas?: number): string {
    return horas ? `${horas}h` : '0h';
  }

  get totalHoras(): number {
    if (!this.parte) return 0;
    // Como el nuevo modelo no tiene campos de horas, retornamos 0
    return 0;
  }

  get tieneHorasExtras(): boolean {
    // Como el nuevo modelo no tiene campos de horas extras, retornamos false
    return false;
  }

  get duracionTrabajo(): string {
    if (!this.parte) return 'Sin datos';
    
    if (this.parte.hora_inicio && this.parte.hora_fin) {
      return `${this.formatearHora(this.parte.hora_inicio)} - ${this.formatearHora(this.parte.hora_fin)}`;
    } else if (this.parte.hora_inicio) {
      return `Iniciado: ${this.formatearHora(this.parte.hora_inicio)}`;
    }
    
    return 'Sin horario definido';
  }

  formatearHora(fechaHora: string): string {
    if (!fechaHora) return '';
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
