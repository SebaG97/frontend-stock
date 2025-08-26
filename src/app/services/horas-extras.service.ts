import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  nombre_completo?: string; // Añadir esta propiedad opcional
}

export interface ResumenHorasExtras {
  tecnico_id: number;
  tecnico_nombre: string;
  tecnico_apellido: string;
  fecha_inicio: string;
  fecha_fin: string;
  horas_normales: number;
  total_horas_extras_normales: number;
  total_horas_extras_especiales: number;
  total_horas_trabajadas: number;
  partes_trabajados: number;
}

export interface ReporteHorasExtras {
  resumen: ResumenHorasExtras[];
  periodo_inicio: string;
  periodo_fin: string;
  total_tecnicos: number;
}

export interface DetalleHorasExtras {
  tecnico: Tecnico;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  partes: Array<{
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    horas_normales: number;
    horas_extras_normales: number;
    horas_extras_especiales: number;
    descripcion: string;
    cliente: string;
  }>;
  totales: {
    total_horas_normales: number;
    total_horas_extras_normales: number;
    total_horas_extras_especiales: number;
    total_horas_trabajadas: number;
    total_partes: number;
  };
}

export interface ParteConHorasExtras {
  fecha: string;
  parte: string;
  horas_trabajadas: number;
  horas_normales: number;
  horas_extras_normales: number;
  horas_extras_especiales: number;
  descripcion: string;
  cliente?: string;
  numero?: string;
  fecha_inicio?: string;
  trabajo_solicitado?: string;
  cliente_empresa?: string;
  total_horas?: number;
  tiene_horas_extras?: boolean; // Campo para marcar visualmente las partes con horas extras
  id?: number;
  orden_trabajo_numero?: string;
}

export interface ResponsePartesConHorasExtras {
  tecnico: Tecnico;
  partes: ParteConHorasExtras[];
  total_horas_normales: number;
  total_horas_extras_normales: number;
  total_horas_extras_especiales: number;
}

@Injectable({
  providedIn: 'root'
})
export class HorasExtrasService {
  private baseUrl = '/api/horas-extras';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el reporte de horas extras con filtros opcionales
   * Endpoint: GET /api/horas-extras/reporte/
   * Nota: Se recomienda siempre enviar fecha_inicio y fecha_fin para mejor rendimiento
   */
  getReporte(fechaInicio?: string, fechaFin?: string, tecnicoId?: number): Observable<ReporteHorasExtras> {
    let params = new HttpParams();
    
    // Solo aplicar lógica de fechas por defecto si ambas fechas están vacías
    if (!fechaInicio && !fechaFin) {
      // Para "Ver Todos", usar un rango muy amplio en lugar del mes actual
      const hoy = new Date();
      const fechaInicioAmplia = new Date(hoy.getFullYear() - 3, 0, 1); // 3 años atrás
      const fechaFinAmplia = new Date(hoy.getFullYear() + 1, 11, 31); // 1 año adelante
      
      fechaInicio = fechaInicioAmplia.toISOString().split('T')[0];
      fechaFin = fechaFinAmplia.toISOString().split('T')[0];
    }
    
    if (fechaInicio) {
      params = params.append('fecha_inicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.append('fecha_fin', fechaFin);
    }
    if (tecnicoId) {
      params = params.append('tecnico_id', tecnicoId.toString());
    }
    
    return this.http.get<ReporteHorasExtras>(`${this.baseUrl}/reporte/`, { params });
  }

  /**
   * Obtiene la lista de técnicos disponibles
   * Endpoint: GET /api/horas-extras/tecnicos/
   */
  getTecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.baseUrl}/tecnicos/`);
  }

  /**
   * Obtiene el detalle de horas extras de un técnico específico
   * Endpoint: GET /api/horas-extras/detalle/{tecnicoId}/
   * Nota: Se recomienda siempre enviar fecha_inicio y fecha_fin
   */
  getDetalleTecnico(tecnicoId: number, fechaInicio?: string, fechaFin?: string): Observable<DetalleHorasExtras> {
    let params = new HttpParams();
    
    // Si no se proporcionan fechas, usar el mes actual por defecto
    if (!fechaInicio || !fechaFin) {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      fechaInicio = fechaInicio || primerDiaMes.toISOString().split('T')[0];
      fechaFin = fechaFin || ultimoDiaMes.toISOString().split('T')[0];
    }
    
    params = params.append('fecha_inicio', fechaInicio);
    params = params.append('fecha_fin', fechaFin);
    
    return this.http.get<DetalleHorasExtras>(`${this.baseUrl}/detalle/${tecnicoId}/`, { params });
  }

  /**
   * Sincroniza los partes de trabajo para actualizar horas extras
   * Endpoint: POST /api/horas-extras/sincronizar-partes/
   */
  sincronizarPartes(): Observable<any> {
    return this.http.post(`${this.baseUrl}/sincronizar-partes/`, {});
  }

  /**
   * Obtiene las partes con horas extras de un técnico específico
   * Endpoint: GET /api/horas-extras/partes/{tecnicoId}/
   */
  getPartesConHorasExtras(params: { tecnico_id: number, fecha_inicio?: string, fecha_fin?: string }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.fecha_inicio) {
      httpParams = httpParams.append('fecha_inicio', params.fecha_inicio);
    }
    if (params.fecha_fin) {
      httpParams = httpParams.append('fecha_fin', params.fecha_fin);
    }
    
    const url = `${this.baseUrl}/partes/${params.tecnico_id}/`;
    console.log('Llamando URL:', url, 'con parámetros:', httpParams.toString());
    
    return this.http.get<any>(url, { params: httpParams });
  }
}
