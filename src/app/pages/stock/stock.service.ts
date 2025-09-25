import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Stock, 
  StockMovimiento, 
  MovimientoMultiple, 
  TransferenciaMultiple, 
  RespuestaMovimientoMultiple, 
  RespuestaTransferenciaMultiple 
} from '../../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient) {}

  getStock(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/`);
  }

  getStockByProducto(producto_id: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/${producto_id}`);
  }

  createStock(stock: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}/`, stock);
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/${id}`, stock);
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMovimientos(): Observable<StockMovimiento[]> {
    return this.http.get<StockMovimiento[]>(`${this.apiUrl}/movimientos/`);
  }

  filtrarMovimientos(params: {
    producto_id?: number;
    deposito_id?: number;
    fecha_ini?: string;
    fecha_fin?: string;
  }): Observable<StockMovimiento[]> {
    let httpParams = new HttpParams();
    if (params.producto_id) httpParams = httpParams.set('producto_id', params.producto_id);
    if (params.deposito_id) httpParams = httpParams.set('deposito_id', params.deposito_id);
    if (params.fecha_ini) httpParams = httpParams.set('fecha_ini', params.fecha_ini);
    if (params.fecha_fin) httpParams = httpParams.set('fecha_fin', params.fecha_fin);
    return this.http.get<StockMovimiento[]>(`${this.apiUrl}/movimientos/filtro/`, { params: httpParams });
  }

  ingresoMovimiento(payload: any): Observable<StockMovimiento> {
    return this.http.post<StockMovimiento>(`${this.apiUrl}/movimientos/ingreso/`, payload);
  }

  egresoMovimiento(payload: any): Observable<StockMovimiento> {
    return this.http.post<StockMovimiento>(`${this.apiUrl}/movimientos/egreso/`, payload);
  }

  ajusteMovimiento(payload: any): Observable<StockMovimiento> {
    return this.http.post<StockMovimiento>(`${this.apiUrl}/movimientos/ajuste/`, payload);
  }

  // ✅ Nuevo método para transferencias de depósito
  transferenciaMovimiento(payload: {
    producto_id: number;
    deposito_origen_id: number;
    deposito_destino_id: number;
    cantidad: number;
    motivo?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimientos/transferencia/`, payload);
  }

  // ✅ Nuevos métodos para movimientos múltiples
  movimientoMultiple(payload: MovimientoMultiple): Observable<RespuestaMovimientoMultiple> {
    return this.http.post<RespuestaMovimientoMultiple>(`${this.apiUrl}/movimientos/multiple/`, payload);
  }

  transferenciaMultiple(payload: TransferenciaMultiple): Observable<RespuestaTransferenciaMultiple> {
    return this.http.post<RespuestaTransferenciaMultiple>(`${this.apiUrl}/movimientos/transferencia-multiple/`, payload);
  }

  syncOrdenes(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-ordenes/`, {});
  }
}
