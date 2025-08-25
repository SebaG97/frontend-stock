export interface Tecnico {
  id: number;
  nombre: string;
  apellido?: string;
  codigo?: string;
  legajo?: string;
  nombre_completo?: string;
}

export interface ParteTrabajo {
  id: number;
  numero: number;                    // Nuevo campo del backend
  ejercicio: string;                 // Nuevo campo del backend
  id_parte_api?: string;
  tecnico_id: number;
  cliente_id?: string;
  cliente_empresa: string;
  cliente_codigoInterno?: string;    // Para mostrar código del cliente
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  estado: string;
  firmado?: boolean;                 // Nuevo campo del backend
  archivado?: boolean;              // Nuevo campo del backend
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
  tecnico?: Tecnico;
  tecnicos_participantes?: Tecnico[];  // Nuevo campo del backend
  created_at?: string;
  updated_at?: string;
}

export enum EstadoParteTrabajo {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',    // Cambio de EN_PROGRESO a EN_PROCESO
  FINALIZADO = 'finalizado',    // Cambio de COMPLETADO a FINALIZADO
  CANCELADO = 'cancelado'
}

export interface ParteTrabajoCreate {
  id_parte_api?: string;     // Cambio de id_api_externa
  tecnico_id: number;
  cliente_empresa: string;   // Cambio de cliente
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  estado?: string;           // Cambio a string
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
}

export interface ParteTrabajoUpdate {
  id_parte_api?: string;     // Cambio de id_api_externa
  tecnico_id?: number;
  cliente_empresa?: string;  // Cambio de cliente
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
  estado?: string;           // Cambio a string
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
}

// Estructura real del backend para estadísticas
export interface BackendResumenStats {
  totales: {
    total: number;
    pendientes: number;
    en_proceso: number;
    finalizados: number;
  };
  por_tecnico: Array<{
    tecnico: string;
    total_partes: number;
  }>;
}

export interface ResumenPartesTrabajo {
  total_partes: number;
  partes_pendientes: number;
  partes_en_proceso: number;    // Cambio de en_progreso a en_proceso
  partes_finalizados: number;   // Cambio de completados a finalizados
  partes_cancelados: number;
  total_horas_trabajadas: number;
  promedio_horas_por_parte: number;
}

export interface FiltrosPartesTrabajo {
  numero?: number;              // Nuevo filtro del backend
  tecnico_id?: number;
  cliente?: string;
  cliente_empresa?: string;     // Nuevo filtro del backend
  estado?: EstadoParteTrabajo;
  ejercicio?: string;           // Nuevo filtro del backend
  firmado?: boolean;            // Nuevo filtro del backend
  archivado?: boolean;          // Nuevo filtro del backend
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}

export interface ResponsePartesTrabajo {
  items: ParteTrabajo[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
