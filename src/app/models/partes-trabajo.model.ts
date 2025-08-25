export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  nombre_completo?: string;
}

export interface ParteTrabajo {
  id: number;
  id_api_externa?: string;
  tecnico_id: number;
  cliente: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  estado: EstadoParteTrabajo;
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
  tecnico?: Tecnico;
  created_at?: string;
  updated_at?: string;
}

export enum EstadoParteTrabajo {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado'
}

export interface ParteTrabajoCreate {
  id_api_externa?: string;
  tecnico_id: number;
  cliente: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion: string;
  estado?: EstadoParteTrabajo;
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
}

export interface ParteTrabajoUpdate {
  id_api_externa?: string;
  tecnico_id?: number;
  cliente?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
  estado?: EstadoParteTrabajo;
  horas_normales?: number;
  horas_extras_normales?: number;
  horas_extras_especiales?: number;
  observaciones?: string;
}

export interface ResumenPartesTrabajo {
  total_partes: number;
  partes_pendientes: number;
  partes_en_progreso: number;
  partes_completados: number;
  partes_cancelados: number;
  total_horas_trabajadas: number;
  promedio_horas_por_parte: number;
}

export interface FiltrosPartesTrabajo {
  tecnico_id?: number;
  cliente?: string;
  estado?: EstadoParteTrabajo;
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
