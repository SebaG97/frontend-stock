import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ParteTrabajo, 
  FiltrosPartesTrabajo, 
  EstadoParteTrabajo,
  ResponsePartesTrabajo,
  ResumenPartesTrabajo,
  ParteTrabajoCreate,
  ParteTrabajoUpdate,
  TecnicoSimple
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
  getPartesTrabajo(filtros?: FiltrosPartesTrabajo): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.skip !== undefined) params = params.set('skip', filtros.skip.toString());
      if (filtros.limit !== undefined) params = params.set('limit', filtros.limit.toString());
      if (filtros.numero) params = params.set('numero', filtros.numero.toString());
      if (filtros.estado !== undefined) params = params.set('estado', filtros.estado.toString());
      if (filtros.tecnico_id) params = params.set('tecnico_id', filtros.tecnico_id.toString());
      if (filtros.cliente_empresa) params = params.set('cliente_empresa', filtros.cliente_empresa);
      if (filtros.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
      if (filtros.archivado !== undefined) params = params.set('archivado', filtros.archivado.toString());
      if (filtros.firmado !== undefined) params = params.set('firmado', filtros.firmado.toString());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener un parte de trabajo por ID
   */
  getParteTrabajoById(id: number): Observable<ParteTrabajo> {
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
   * Eliminar orden de trabajo
   */
  deleteParteTrabajo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Asignar técnico a un parte de trabajo
   */
  asignarTecnico(parteId: number, tecnicoId: number): Observable<ParteTrabajo> {
    return this.http.post<ParteTrabajo>(`${this.apiUrl}/${parteId}/tecnicos/${tecnicoId}`, {});
  }

  /**
   * Desasignar técnico de un parte de trabajo
   */
  desasignarTecnico(parteId: number, tecnicoId: number): Observable<ParteTrabajo> {
    return this.http.delete<ParteTrabajo>(`${this.apiUrl}/${parteId}/tecnicos/${tecnicoId}`);
  }

  /**
   * Obtener técnicos disponibles
   */
  getTecnicos(): Observable<TecnicoSimple[]> {
    return this.http.get<TecnicoSimple[]>('http://localhost:8000/api/horas-extras/tecnicos');
  }

  /**
   * Obtener estados disponibles
   */
  getEstadosDisponibles(): number[] {
    return [1, 2, 3, 4]; // 1: Pendiente, 2: En Proceso, 3: Finalizado, 4: Cancelado
  }

  /**
   * Formatear estado para mostrar
   */
  formatearEstado(estado: number): string {
    switch (estado) {
      case 1: return 'Pendiente';
      case 2: return 'En Proceso';
      case 3: return 'Finalizado';
      case 4: return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  /**
   * Obtener clase CSS para estado
   */
  getClaseEstado(estado: number): string {
    switch (estado) {
      case 1: return 'badge-warning';
      case 2: return 'badge-info';
      case 3: return 'badge-success';
      case 4: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  /**
   * Buscar partes de trabajo (usa el mismo endpoint con filtros)
   */
  buscarPartesTrabajo(query: string): Observable<any> {
    let params = new HttpParams()
      .set('limit', '100'); // Aumentar límite para búsqueda
    
    // Intentar buscar por múltiples campos
    if (query.trim()) {
      params = params.set('cliente_empresa', query.trim());
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener resumen estadístico (mock por ahora)
   */
  getResumenStats(): Observable<ResumenPartesTrabajo> {
    // Mock data - el backend aún no tiene este endpoint
    return new Observable(observer => {
      observer.next({
        total_partes: 0,
        partes_pendientes: 0,
        partes_en_proceso: 0,
        partes_finalizados: 0,
        partes_cancelados: 0,
        total_horas_trabajadas: 0,
        promedio_horas_por_parte: 0
      });
    });
  }
}
