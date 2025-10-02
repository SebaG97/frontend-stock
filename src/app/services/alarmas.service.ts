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

  // Lista de vessels de prueba que se excluyen de la vista
  private readonly vesselsExcluidos = [
    'TEST_ADM',
    'PIRARUCU',
    'HERKULES XVI',
    'HERKULES V',
    'HERKULES XV',
    'HERKULES IV',
    'GRUS',
    'CENTAURUS',
    'PEGASUS',
    'HYDRA',
    'LYNX',
    'PHOENIX',
    'SCORPIUS',
    'AQUARIUS',
    'AQUILA'
  ];

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
        const todosLosVessels = response.alarmas || [];
        
        // Filtrar vessels excluidos
        const vesselsFiltrasdos = todosLosVessels.filter(vessel => 
          !this.vesselsExcluidos.includes(vessel.vessel_name)
        );
        
        console.log(`🔍 Vessels filtrados: ${todosLosVessels.length} → ${vesselsFiltrasdos.length} (excluidos: ${todosLosVessels.length - vesselsFiltrasdos.length})`);
        
        return vesselsFiltrasdos;
      })
    );
  }

  /**
   * Obtiene el resumen estadístico de vessels por estado (calculado con vessels filtrados)
   */
  getResumenAlarmas(): Observable<ResumenAlarmas> {
    // Obtener todos los vessels ya filtrados y calcular estadísticas
    return this.getAlarmas().pipe(
      map(vessels => {
        const total = vessels.length;
        
        // Contar por estado usando la lógica del frontend
        const normales = vessels.filter(v => this.getEstadoFrontend(v) === 'normal').length;
        const advertencia = vessels.filter(v => this.getEstadoFrontend(v) === 'warning').length;  
        const atencion = vessels.filter(v => this.getEstadoFrontend(v) === 'attention').length;
        const criticos = vessels.filter(v => this.getEstadoFrontend(v) === 'critical').length;
        
        const porcentajeOperativo = total > 0 ? Math.round((normales / total) * 100) : 0;
        
        console.log(`📊 Resumen calculado (filtrado): Total: ${total}, Normal: ${normales}, Advertencia: ${advertencia}, Atención: ${atencion}, Críticos: ${criticos}`);
        
        return {
          total_vessels: total,
          vessels_normales: normales,
          vessels_advertencia: advertencia,
          vessels_atencion: atencion,
          vessels_criticos: criticos,
          porcentaje_operativo: porcentajeOperativo
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
   * Obtiene el estado en formato frontend de un vessel
   */
  getEstadoFrontend(vessel: Vessel): string {
    return this.convertirEstadoAFrontend(vessel.estado_alarma);
  }

  /**
   * Obtiene la lista de vessels excluidos (para referencia o debugging)
   */
  getVesselsExcluidos(): string[] {
    return [...this.vesselsExcluidos]; // Retorna copia para evitar mutaciones
  }

  /**
   * Verifica si un vessel está en la lista de exclusión
   */
  isVesselExcluido(vesselName: string): boolean {
    return this.vesselsExcluidos.includes(vesselName);
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