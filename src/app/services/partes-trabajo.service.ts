import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ParteTrabajo,
  ParteTrabajoCreate,
  ParteTrabajoUpdate,
  ResponsePartesTrabajo,
  ResumenPartesTrabajo,
  FiltrosPartesTrabajo,
  EstadoParteTrabajo,
  Tecnico
} from '../models/partes-trabajo.model';

@Injectable({
  providedIn: 'root'
})
export class PartesTrabajoService {
  private apiUrl = '/api/partes-trabajo';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las órdenes de trabajo con filtros y paginación
   */
  getPartesTrabajo(filtros?: FiltrosPartesTrabajo): Observable<ResponsePartesTrabajo> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.tecnico_id) params = params.set('tecnico_id', filtros.tecnico_id.toString());
      if (filtros.cliente) params = params.set('cliente', filtros.cliente);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<ResponsePartesTrabajo>(this.apiUrl, { params });
  }

  /**
   * Obtener una orden de trabajo por ID
   */
  getParteTrabajo(id: number): Observable<ParteTrabajo> {
    return this.http.get<ParteTrabajo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva orden de trabajo
   */
  createParteTrabajo(parteTrabajo: ParteTrabajoCreate): Observable<ParteTrabajo> {
    return this.http.post<ParteTrabajo>(this.apiUrl, parteTrabajo);
  }

  /**
   * Actualizar orden de trabajo completa
   */
  updateParteTrabajo(id: number, parteTrabajo: ParteTrabajoUpdate): Observable<ParteTrabajo> {
    return this.http.put<ParteTrabajo>(`${this.apiUrl}/${id}`, parteTrabajo);
  }

  /**
   * Actualizar solo el estado de una orden de trabajo
   */
  updateEstadoParteTrabajo(id: number, estado: EstadoParteTrabajo): Observable<ParteTrabajo> {
    return this.http.patch<ParteTrabajo>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  /**
   * Eliminar orden de trabajo
   */
  deleteParteTrabajo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener resumen estadístico
   */
  getResumenStats(): Observable<ResumenPartesTrabajo> {
    return this.http.get<ResumenPartesTrabajo>(`${this.apiUrl}/stats/resumen`);
  }

  /**
   * Buscar órdenes de trabajo por texto
   */
  buscarPartesTrabajo(query: string): Observable<ParteTrabajo[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ParteTrabajo[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Obtener lista de técnicos del endpoint de horas-extras
   */
  getTecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>('/api/horas-extras/tecnicos/');
  }

  /**
   * Obtener estados disponibles
   */
  getEstadosDisponibles(): EstadoParteTrabajo[] {
    return Object.values(EstadoParteTrabajo);
  }

  /**
   * Formatear estado para mostrar
   */
  formatearEstado(estado: EstadoParteTrabajo): string {
    const estados = {
      [EstadoParteTrabajo.PENDIENTE]: 'Pendiente',
      [EstadoParteTrabajo.EN_PROGRESO]: 'En Progreso',
      [EstadoParteTrabajo.COMPLETADO]: 'Completado',
      [EstadoParteTrabajo.CANCELADO]: 'Cancelado'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtener clase CSS para estado
   */
  getClaseEstado(estado: EstadoParteTrabajo): string {
    const clases = {
      [EstadoParteTrabajo.PENDIENTE]: 'badge badge-warning',
      [EstadoParteTrabajo.EN_PROGRESO]: 'badge badge-info',
      [EstadoParteTrabajo.COMPLETADO]: 'badge badge-success',
      [EstadoParteTrabajo.CANCELADO]: 'badge badge-danger'
    };
    return clases[estado] || 'badge badge-secondary';
  }
}
