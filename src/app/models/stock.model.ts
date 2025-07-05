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
