// ===============================================
// 💰 Modelos para el Módulo Caja Chica
// ===============================================

// 📊 Modelo para el resumen de Caja Chica
export interface CajaChica {
  id: number;
  saldo_actual: number;
  monto_inicial: number;
  descripcion?: string;
  fecha_creacion: string;
}

// 💸 Modelo para los Gastos
export interface Gasto {
  id: number;
  proveedor_id: number;
  proveedor: Proveedor;
  numero_factura: string;
  fecha_factura: string;
  descripcion: string;
  monto_total: number;
  productos: ProductoGasto[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// 🔄 Modelo simplificado para el listado
export interface GastoResumen {
  id: number;
  numero_factura: string;
  proveedor: {
    id: number;
    nombre: string;
    ruc?: string;
  };
  fecha_factura: string;
  descripcion: string;
  monto_total: number;
  cantidad_productos: number;
  fecha_creacion: string;
}

// 📋 Modelo para productos en gastos
export interface ProductoGasto {
  id?: number;
  producto_id: number;
  producto?: {
    id: number;
    nombre: string;
    codigo?: string;
  };
  deposito_id: number;
  deposito?: {
    id: number;
    nombre: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// 🏢 Modelo para proveedores (compatible con el existente)
export interface Proveedor {
  id: number;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

// 📦 Modelo para productos
export interface Producto {
  id: number;
  nombre: string;
  codigo?: string;
  precio: number;
  stock_actual?: number;
}

// 🏪 Modelo para depósitos
export interface Deposito {
  id: number;
  nombre: string;
  descripcion?: string;
}

// ===============================================
// 📥 DTOs para creación y actualización
// ===============================================

// 💸 DTO para crear gasto
export interface GastoCreate {
  tipo_gasto: 'productos' | 'simple';
  proveedor_id?: number;
  proveedor_nombre?: string;  // Para crear proveedor nuevo
  numero_factura?: string; // Opcional para gastos simples
  fecha_factura: string;
  descripcion: string;
  monto_total?: number; // Para gastos simples
  productos?: ProductoGastoCreate[]; // Opcional para gastos simples
}

// 📋 DTO para productos en gasto
export interface ProductoGastoCreate {
  producto_id: number;
  deposito_id: number;
  cantidad: number;
  precio_unitario: number;
}

// 🏢 DTO para crear proveedor
export interface ProveedorCreate {
  nombre: string;
  ruc: string; // RUC requerido para nuevos proveedores
  direccion?: string;
  telefono?: string;
  email?: string;
}

// ===============================================
// 📊 Responses de la API
// ===============================================

// 📊 Response del resumen de caja chica
export interface ResumenCajaChica {
  caja_chica: CajaChica;
  gastos_totales: number;
  gastos_del_mes: number;
  ultimo_gasto?: GastoResumen | null;
  estadisticas?: {
    total_gastos: number;
    promedio_mensual: number;
    mayor_gasto: number;
    cantidad_proveedores: number;
  };
}

// 📋 Response de lista paginada de gastos
export interface ResponseGastos {
  gastos: GastoResumen[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ===============================================
// 🔍 Filtros para búsquedas
// ===============================================

export interface FiltrosGastos {
  mes?: number;
  año?: number;
  proveedor_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  numero_factura?: string;
  descripcion?: string;
  skip?: number;
  limit?: number;
}

// ===============================================
// 📈 Enums y constantes
// ===============================================

export enum TipoMovimiento {
  GASTO = 'gasto',
  INGRESO = 'ingreso'
}

// 🏷️ Severidad para alertas/notificaciones
export enum SeveridadAlerta {
  SUCCESS = 'success',
  INFO = 'info', 
  WARNING = 'warn',
  ERROR = 'error'
}

// 💰 Modelo para ajuste de saldo
export interface AjusteSaldo {
  tipo_operacion: 'incrementar' | 'decrementar' | 'establecer';
  nuevo_monto: number;
  motivo: string;
  fecha?: string;
}

// 💰 Configuración de formatos
export const FORMATO_MONEDA = {
  style: 'currency',
  currency: 'UYU',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

// 📅 Configuración de fechas
export const FORMATO_FECHA = 'dd/MM/yyyy';
export const FORMATO_FECHA_API = 'yyyy-MM-dd';