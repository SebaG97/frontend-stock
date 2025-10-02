export interface Vessel {
  vessel_name: string;
  ultimo_dato?: string;
  horas_sin_datos?: number;
  estado_alarma: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  mensaje: string;
  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  course?: number | null;
}

// Respuesta del backend para alarmas
export interface AlarmasResponse {
  total_vessels: number;
  alarmas: Vessel[];
}

// Respuesta del backend para resumen
export interface ResumenResponse {
  total_vessels: number;
  conteo_por_estado: {
    verde: number;
    amarillo: number;
    naranja: number;
    rojo: number;
  };
  porcentajes: {
    verde: number;
    amarillo: number;
    naranja: number;
    rojo: number;
  };
}

// Interface procesada para el frontend
export interface ResumenAlarmas {
  total_vessels: number;
  vessels_normales: number;
  vessels_advertencia: number;
  vessels_atencion: number;
  vessels_criticos: number;
  porcentaje_operativo: number;
}

export interface VesselDetalle extends Vessel {
  measurements_count?: number;
  first_measurement?: string;
  avg_speed?: number;
  max_speed?: number;
  min_speed?: number;
}

export interface FiltroAlarmas {
  estado?: 'normal' | 'warning' | 'attention' | 'critical';
  horas_critico?: number;
  vessel_name?: string;
  orden?: 'asc' | 'desc';
  campo_orden?: 'vessel_name' | 'hours_since_last' | 'last_measurement';
}