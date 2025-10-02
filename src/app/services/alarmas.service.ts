import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vessel, ResumenAlarmas, VesselDetalle, FiltroAlarmas, AlarmasResponse, ResumenResponse } from '../models/alarmas.model';

@Injectable({
  providedIn: 'root'
})
export class AlarmasService {
  private readonly apiUrl = `${environment.apiUrl}/alarmas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el listado completo de vessels con su estado de alarma
   */
  getAlarmas(filtros?: FiltroAlarmas): Observable<Vessel[]> {
    let params = new HttpParams();
    
    // Convertir estados del frontend al formato del backend
    if (filtros?.estado) {
      const estadoBackend = this.convertirEstadoABackend(filtros.estado);
      params = params.set('estado', estadoBackend);
    }
    if (filtros?.vessel_name) {
      params = params.set('vessel_name', filtros.vessel_name);
    }
    if (filtros?.orden) {
      params = params.set('orden', filtros.orden);
    }
    if (filtros?.campo_orden) {
      params = params.set('campo_orden', filtros.campo_orden);
    }

    const url = this.apiUrl;
    console.log('🌐 Llamando a GET /alarmas:', url, { params: params.toString() });
    
    return this.http.get<AlarmasResponse>(url, { params }).pipe(
      map(response => {
        console.log('📦 Respuesta completa del backend:', response);
        return response.alarmas || [];
      })
    );
  }

  /**
   * Obtiene el resumen estadístico de vessels por estado
   */
  getResumenAlarmas(): Observable<ResumenAlarmas> {
    const url = `${this.apiUrl}/resumen`;
    console.log('📊 Llamando a GET /alarmas/resumen:', url);
    
    return this.http.get<ResumenResponse>(url).pipe(
      map(response => {
        console.log('📊 Respuesta resumen del backend:', response);
        
        // Convertir respuesta del backend al formato del frontend
        return {
          total_vessels: response.total_vessels,
          vessels_normales: response.conteo_por_estado.verde,
          vessels_advertencia: response.conteo_por_estado.amarillo,
          vessels_atencion: response.conteo_por_estado.naranja,
          vessels_criticos: response.conteo_por_estado.rojo,
          porcentaje_operativo: response.porcentajes.verde
        };
      })
    );
  }

  /**
   * Obtiene solo los vessels en estado crítico
   */
  getVesselsCriticos(horas: number = 12): Observable<Vessel[]> {
    const params = new HttpParams().set('horas', horas.toString());
    return this.http.get<Vessel[]>(`${this.apiUrl}/criticos`, { params });
  }

  /**
   * Obtiene el detalle completo de un vessel específico
   */
  getVesselDetalle(vesselName: string): Observable<VesselDetalle> {
    return this.http.get<VesselDetalle>(`${this.apiUrl}/vessel/${encodeURIComponent(vesselName)}`);
  }

  /**
   * Obtiene vessels filtrados por tiempo desde última medición
   */
  getVesselsPorTiempo(horasMinimas: number): Observable<Vessel[]> {
    const params = new HttpParams().set('horas', horasMinimas.toString());
    return this.http.get<Vessel[]>(`${this.apiUrl}/criticos`, { params });
  }

  /**
   * Formatea el tiempo transcurrido desde la última medición
   */
  formatearTiempoTranscurrido(horas: number): string {
    if (horas < 1) {
      const minutos = Math.floor(horas * 60);
      return `${minutos} min`;
    } else if (horas < 24) {
      return `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = Math.floor(horas % 24);
      return `${dias}d ${horasRestantes}h`;
    }
  }

  /**
   * Obtiene la clase CSS según el estado del vessel
   */
  getClaseEstado(status: string): string {
    const clases = {
      'normal': 'status-normal',
      'warning': 'status-warning', 
      'attention': 'status-attention',
      'critical': 'status-critical'
    };
    return clases[status as keyof typeof clases] || 'status-unknown';
  }

  /**
   * Obtiene el color de estado según las horas transcurridas
   */
  getColorPorHoras(horas?: number): string {
    if (!horas) return '#28a745'; // Verde por defecto
    
    if (horas < 2) return '#28a745';      // Verde - Normal
    if (horas < 8) return '#ffc107';      // Amarillo - Advertencia
    if (horas < 12) return '#fd7e14';     // Naranja - Atención
    return '#dc3545';                     // Rojo - Crítico
  }

  /**
   * Obtiene el estado según las horas transcurridas
   */
  getEstadoPorHoras(horas?: number): 'normal' | 'warning' | 'attention' | 'critical' {
    if (!horas) return 'normal';
    
    if (horas < 2) return 'normal';
    if (horas < 8) return 'warning';
    if (horas < 12) return 'attention';
    return 'critical';
  }

  /**
   * Convierte estado del frontend al formato del backend
   */
  private convertirEstadoABackend(estado: string): string {
    const conversion: Record<string, string> = {
      'normal': 'verde',
      'warning': 'amarillo',
      'attention': 'naranja',
      'critical': 'rojo'
    };
    return conversion[estado] || estado;
  }

  /**
   * Convierte estado del backend al formato del frontend
   */
  convertirEstadoAFrontend(estadoBackend: string): 'normal' | 'warning' | 'attention' | 'critical' {
    const conversion: Record<string, 'normal' | 'warning' | 'attention' | 'critical'> = {
      'verde': 'normal',
      'amarillo': 'warning',
      'naranja': 'attention',
      'rojo': 'critical'
    };
    return conversion[estadoBackend] || 'normal';
  }

  /**
   * Obtiene el texto del estado en español
   */
  getTextoEstado(status: string): string {
    const textos = {
      'normal': 'Operativo',
      'warning': 'Advertencia',
      'attention': 'Atención',
      'critical': 'Crítico'
    };
    return textos[status as keyof typeof textos] || 'Desconocido';
  }
}