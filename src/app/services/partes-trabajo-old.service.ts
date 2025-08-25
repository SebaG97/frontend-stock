import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ParteTrabajo, EstadoParteTrabajo, ResponsePartesTrabajo } from '../models/partes-trabajo.model';

@Injectable({
  providedIn: 'root'
})
export class PartesTrabajoService {
  private apiUrl = 'http://localhost:8000/api/partes-trabajo';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las órdenes de trabajo con filtros y paginación
   */
  getPartesTrabajo(filtros?: FiltrosPartesTrabajo): Observable<ResponsePartesTrabajo> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.numero) params = params.set('numero', filtros.numero.toString());
      if (filtros.tecnico_id) params = params.set('tecnico_id', filtros.tecnico_id.toString());
      if (filtros.cliente) params = params.set('cliente', filtros.cliente);
      if (filtros.cliente_empresa) params = params.set('cliente_empresa', filtros.cliente_empresa);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.ejercicio) params = params.set('ejercicio', filtros.ejercicio);
      if (filtros.firmado !== undefined) params = params.set('firmado', filtros.firmado.toString());
      if (filtros.archivado !== undefined) params = params.set('archivado', filtros.archivado.toString());
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    // El backend retorna un array simple, así que lo adaptamos al formato esperado
    return this.http.get<ParteTrabajo[]>(this.apiUrl, { params }).pipe(
      map((items: ParteTrabajo[]) => ({
        items: items,
        total: items.length,
        page: filtros?.page || 1,
        limit: filtros?.limit || 10,
        pages: Math.ceil(items.length / (filtros?.limit || 10))
      }))
    );
  }

  /**
   * Obtener un parte de trabajo por número
   */
  getParteTrabajoByNumero(numero: number): Observable<ParteTrabajo> {
    return this.http.get<ParteTrabajo>(`${this.apiUrl}/${numero}`);
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
  updateParteTrabajo(numero: number, parteTrabajo: ParteTrabajoUpdate): Observable<ParteTrabajo> {
    return this.http.put<ParteTrabajo>(`${this.apiUrl}/${numero}`, parteTrabajo);
  }

  /**
   * Actualizar solo el estado de una orden de trabajo
   */
  updateEstadoParteTrabajo(numero: number, estado: string): Observable<ParteTrabajo> {
    return this.http.patch<ParteTrabajo>(`${this.apiUrl}/${numero}/estado`, { estado });
  }

  /**
   * Eliminar orden de trabajo
   */
  deleteParteTrabajo(numero: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numero}`);
  }

  /**
   * Obtener resumen estadístico
   */
  getResumenStats(): Observable<ResumenPartesTrabajo> {
    return this.http.get<BackendResumenStats>(`${this.apiUrl}/stats/resumen`).pipe(
      map((backendData: BackendResumenStats) => ({
        total_partes: backendData.totales.total,
        partes_pendientes: backendData.totales.pendientes,
        partes_en_proceso: backendData.totales.en_proceso,
        partes_finalizados: backendData.totales.finalizados,
        partes_cancelados: 0, // No disponible en el backend actual
        total_horas_trabajadas: 0, // No disponible en el backend actual
        promedio_horas_por_parte: 0 // No disponible en el backend actual
      }))
    );
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
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ParteTrabajo,
  ParteTrabajoCreate,
  ParteTrabajoUpdate,
  ResponsePartesTrabajo,
  ResumenPartesTrabajo,
  BackendResumenStats,
  FiltrosPartesTrabajo,
  EstadoParteTrabajo,
  Tecnico
} from '../models/partes-trabajo.model';

@Injectable({
  providedIn: 'root'
})
export class PartesTrabajoService {
  private apiUrl = 'http://localhost:8000/api/partes-trabajo';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las órdenes de trabajo con filtros y paginación
   */
  getPartesTrabajo(filtros?: FiltrosPartesTrabajo): Observable<ResponsePartesTrabajo> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.numero) params = params.set('numero', filtros.numero.toString());
      if (filtros.tecnico_id) params = params.set('tecnico_id', filtros.tecnico_id.toString());
      if (filtros.cliente) params = params.set('cliente', filtros.cliente);
      if (filtros.cliente_empresa) params = params.set('cliente_empresa', filtros.cliente_empresa);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.ejercicio) params = params.set('ejercicio', filtros.ejercicio);
      if (filtros.firmado !== undefined) params = params.set('firmado', filtros.firmado.toString());
      if (filtros.archivado !== undefined) params = params.set('archivado', filtros.archivado.toString());
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    // El backend retorna un array simple, así que lo adaptamos al formato esperado
    return this.http.get<ParteTrabajo[]>(this.apiUrl, { params }).pipe(
      map((items: ParteTrabajo[]) => ({
        items: items,
        total: items.length,
        page: filtros?.page || 1,
        limit: filtros?.limit || 10,
        pages: Math.ceil(items.length / (filtros?.limit || 10))
      }))
    );
  }

  /**
   * Obtener un parte de trabajo por número
   */
  getParteTrabajoByNumero(numero: number): Observable<ParteTrabajo> {
    return this.http.get<ParteTrabajo>(`${this.apiUrl}/${numero}`);
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
  updateParteTrabajo(numero: number, parteTrabajo: ParteTrabajoUpdate): Observable<ParteTrabajo> {
    return this.http.put<ParteTrabajo>(`${this.apiUrl}/${numero}`, parteTrabajo);
  }

  /**
   * Actualizar solo el estado de una orden de trabajo
   */
  updateEstadoParteTrabajo(numero: number, estado: string): Observable<ParteTrabajo> {
    return this.http.patch<ParteTrabajo>(`${this.apiUrl}/${numero}/estado`, { estado });
  }

  /**
   * Eliminar orden de trabajo
   */
  deleteParteTrabajo(numero: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numero}`);
  }

  /**
   * Obtener resumen estadístico
   */
  getResumenStats(): Observable<ResumenPartesTrabajo> {
    return this.http.get<BackendResumenStats>(`${this.apiUrl}/stats/resumen`).pipe(
      map((backendData: BackendResumenStats) => ({
        total_partes: backendData.totales.total,
        partes_pendientes: backendData.totales.pendientes,
        partes_en_proceso: backendData.totales.en_proceso,
        partes_finalizados: backendData.totales.finalizados,
        partes_cancelados: 0, // No disponible en el backend actual
        total_horas_trabajadas: 0, // No disponible en el backend actual
        promedio_horas_por_parte: 0 // No disponible en el backend actual
      }))
    );
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
    return this.http.get<Tecnico[]>('http://localhost:8000/api/horas-extras/tecnicos/');
  }

  /**
   * Obtener estados disponibles
   */
  getEstadosDisponibles(): string[] {
    return ['pendiente', 'en_proceso', 'finalizado', 'cancelado'];
  }

  /**
   * Obtener ejercicios disponibles
   */
  getEjerciciosDisponibles(): string[] {
    // Se puede obtener del backend o manejar localmente
    const currentYear = new Date().getFullYear();
    return [
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
      (currentYear - 3).toString()
    ];
  }

  /**
   * Formatear estado para mostrar
   */
  formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtener clase CSS para estado
   */
  getClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'p-badge p-badge-warning',
      'en_proceso': 'p-badge p-badge-info',
      'finalizado': 'p-badge p-badge-success',
      'cancelado': 'p-badge p-badge-danger'
    };
    return clases[estado] || 'p-badge p-badge-secondary';
  }

  /**
   * Obtener icono para estado
   */
  getIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'pendiente': 'pi pi-clock',
      'en_proceso': 'pi pi-spin pi-spinner',
      'finalizado': 'pi pi-check',
      'cancelado': 'pi pi-times'
    };
    return iconos[estado] || 'pi pi-info-circle';
  }

  /**
   * Obtener severidad para PrimeNG
   */
  getSeverityEstado(estado: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
      'pendiente': 'warning',
      'en_proceso': 'info',
      'finalizado': 'success',
      'cancelado': 'danger'
    };
    return severities[estado] || 'secondary';
  }
}
