export interface TecnicoSimple {
  id: number;
  user: string;                        // Email técnico
  nombre: string;
  tipocuenta: number;
}

export interface ParteTrabajo {
  id: number;                           // ID local BD (usar para navegación)
  id_parte_api: string;                 // ID API externa (ej: "CC395D5D5F2")
  numero: number;                       // Número parte (ej: 113)
  ejercicio: string;                    // Año (ej: "2025")
  fecha: string;                        // ISO format
  hora_ini?: string;
  hora_fin?: string;
  trabajo_solicitado: string;
  notas?: string;
  estado: number;
  cliente_empresa?: string;
  archivado: boolean;
  firmado: boolean;
  tecnicos: TecnicoSimple[];           // ARRAY DE TÉCNICOS (NUEVO)
}

// PARÁMETROS DE FILTRADO:
export interface FiltrosPartesTrabajo {
  skip?: number;                       // Paginación offset
  limit?: number;                      // Cantidad registros
  numero?: number;                     // Filtrar por número
  estado?: number;                     // Filtrar por estado
  tecnico_id?: number;                 // Filtrar por técnico
  cliente_empresa?: string;            // Filtrar por cliente
  fecha_desde?: string;                // YYYY-MM-DD
  fecha_hasta?: string;                // YYYY-MM-DD
  archivado?: boolean;
  firmado?: boolean;
}

export interface ResponsePartesTrabajo {
  items: ParteTrabajo[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ResumenPartesTrabajo {
  total_partes: number;
  partes_pendientes: number;
  partes_en_proceso: number;
  partes_finalizados: number;
  partes_cancelados: number;
  total_horas_trabajadas: number;
  promedio_horas_por_parte: number;
}

// Para compatibilidad con componentes existentes
export type EstadoParteTrabajo = number;

export interface ParteTrabajoCreate {
  id_parte_api?: string;
  numero: number;
  ejercicio: string;
  fecha: string;
  hora_ini?: string;
  hora_fin?: string;
  trabajo_solicitado: string;
  notas?: string;
  estado: number;
  cliente_empresa?: string;
  archivado?: boolean;
  firmado?: boolean;
}

export interface ParteTrabajoUpdate {
  id_parte_api?: string;
  numero?: number;
  ejercicio?: string;
  fecha?: string;
  hora_ini?: string;
  hora_fin?: string;
  trabajo_solicitado?: string;
  notas?: string;
  estado?: number;
  cliente_empresa?: string;
  archivado?: boolean;
  firmado?: boolean;
}
