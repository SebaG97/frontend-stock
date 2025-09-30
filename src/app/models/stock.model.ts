export interface Stock {
  id: number;
  producto_id: number;
  deposito_id: number;
  existencia: number;
  stock_minimo: number;
  producto?: Producto;
  deposito?: Deposito;
}

export interface StockMovimiento {
  id: number;
  producto_id: number;
  deposito_id: number;
  cantidad: number;
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  motivo?: string;
  fecha: string;
  observaciones?: string;
  producto?: Producto;
  deposito?: Deposito;
  cliente_id?: number;
  cliente_empresa?: string;
}

export interface Producto {
  id: number;
  descripcion: string;
  codigo?: string;
  rubro_id?: number;
  marca_id?: number;
  tipo_producto_id?: number;
  proveedor_id?: number;
  linea_id?: number;
  procedencia_id?: number;
  ingreso?: string;
  foto?: string;
  estado_id?: number;
}

export interface Deposito {
  id: number;
  nombre: string;
}

// ✅ Nuevas interfaces para movimientos múltiples
export interface ItemMovimiento {
  producto_id: number;
  cantidad: number;
  producto?: Producto;
}

export interface ItemTransferencia {
  producto_id: number;
  cantidad: number;
  producto?: Producto;
}

export interface MovimientoMultiple {
  deposito_id: number;
  tipo: 'ingreso' | 'egreso';
  motivo: string;
  observaciones?: string;
  parte_trabajo_id?: number;
  items: ItemMovimiento[];
}

export interface TransferenciaMultiple {
  deposito_origen_id: number;
  deposito_destino_id: number;
  motivo?: string;
  observaciones?: string;
  parte_trabajo_id?: number;
  items: ItemTransferencia[];
}

export interface ResultadoItemMovimiento {
  producto_id: number;
  cantidad: number;
  exito: boolean;
  mensaje?: string;
  producto?: Producto;
}

export interface ResultadoItemTransferencia {
  producto_id: number;
  cantidad: number;
  exito: boolean;
  mensaje?: string;
  producto?: Producto;
}

export interface RespuestaMovimientoMultiple {
  exito: boolean;
  mensaje: string;
  total_items: number;
  items_exitosos: number;
  items_fallidos: number;
  valor_total_movido: number;
  resultados: ResultadoItemMovimiento[];
}

export interface RespuestaTransferenciaMultiple {
  exito: boolean;
  mensaje: string;
  total_items: number;
  items_exitosos: number;
  items_fallidos: number;
  valor_total_transferido: number;
  resultados: ResultadoItemTransferencia[];
}
