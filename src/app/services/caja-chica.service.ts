import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  ResumenCajaChica,
  ResponseGastos,
  Gasto,
  GastoCreate,
  FiltrosGastos,
  Proveedor,
  Producto,
  Deposito,
  AjusteSaldo
} from '../models/caja-chica.model';

/**
 * 🏦 Servicio principal para la gestión de Caja Chica
 * 
 * Maneja todas las operaciones relacionadas con:
 * - Resumen y dashboard de caja chica
 * - Gestión de gastos (CRUD)
 * - Consulta de proveedores, productos y depósitos
 * 
 * Base URL: /api/caja-chica
 */
@Injectable({
  providedIn: 'root'
})
export class CajaChicaService {
  private readonly baseUrl = `${environment.apiUrl}/caja-chica`;
  private readonly gastosUrl = `${environment.apiUrl}/gastos`;
  private readonly proveedoresUrl = `${environment.apiUrl}/proveedores`;
  private readonly productosUrl = `${environment.apiUrl}/productos`;
  private readonly depositosUrl = `${environment.apiUrl}/depositos`;

  constructor(private http: HttpClient) {}

  // ===============================================
  // 📊 DASHBOARD Y RESUMEN
  // ===============================================

  /**
   * Obtener resumen completo de caja chica para dashboard
   * GET /caja-chica/resumen
   */
  obtenerResumen(): Observable<ResumenCajaChica> {
    return this.http.get<ResumenCajaChica>(`${this.baseUrl}/resumen`);
  }

  // ===============================================
  // 💸 GESTIÓN DE GASTOS
  // ===============================================

  /**
   * Listar gastos con filtros y paginación
   * GET /gastos/?mes=1&año=2024&skip=0&limit=10
   */
  listarGastos(filtros?: FiltrosGastos): Observable<ResponseGastos> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.mes !== undefined) params = params.set('mes', filtros.mes.toString());
      if (filtros.año !== undefined) params = params.set('año', filtros.año.toString());
      if (filtros.proveedor_id) params = params.set('proveedor_id', filtros.proveedor_id.toString());
      if (filtros.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
      if (filtros.numero_factura) params = params.set('numero_factura', filtros.numero_factura);
      if (filtros.descripcion) params = params.set('descripcion', filtros.descripcion);
      if (filtros.skip !== undefined) params = params.set('skip', filtros.skip.toString());
      if (filtros.limit !== undefined) params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<ResponseGastos>(`${this.gastosUrl}/`, { params });
  }

  /**
   * Obtener detalle completo de un gasto
   * GET /gastos/{id}
   */
  obtenerGastoPorId(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.gastosUrl}/${id}`);
  }

  /**
   * Crear nuevo gasto
   * POST /gastos/
   */
  crearGasto(gasto: GastoCreate): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.gastosUrl}/`, gasto);
  }

  /**
   * Actualizar gasto existente
   * PUT /gastos/{id}
   */
  actualizarGasto(id: number, gasto: GastoCreate): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.gastosUrl}/${id}`, gasto);
  }

  /**
   * Eliminar gasto (revierte stock automáticamente)
   * DELETE /gastos/{id}
   */
  eliminarGasto(id: number): Observable<any> {
    return this.http.delete(`${this.gastosUrl}/${id}`);
  }

  // ===============================================
  // 🔍 BÚSQUEDAS Y AUTOCOMPLETE
  // ===============================================

  /**
   * Buscar gastos por texto libre
   */
  buscarGastos(query: string): Observable<ResponseGastos> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', '10');
    
    return this.http.get<ResponseGastos>(`${this.gastosUrl}/search`, { params });
  }

  // ===============================================
  // 🏢 PROVEEDORES
  // ===============================================

  /**
   * Obtener todos los proveedores para selectores
   * GET /proveedores/
   */
  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.proveedoresUrl}/`);
  }

  /**
   * Buscar proveedores por nombre
   */
  buscarProveedores(query: string): Observable<Proveedor[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Proveedor[]>(`${this.proveedoresUrl}/search`, { params });
  }

  // ===============================================
  // 📦 PRODUCTOS
  // ===============================================

  /**
   * Obtener todos los productos para tabla de gastos
   * GET /productos/
   */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.productosUrl}/`);
  }

  /**
   * Buscar productos por nombre o código
   */
  buscarProductos(query: string): Observable<Producto[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Producto[]>(`${this.productosUrl}/search`, { params });
  }

  // ===============================================
  // 🏪 DEPÓSITOS
  // ===============================================

  /**
   * Obtener todos los depósitos
   * GET /depositos/
   */
  obtenerDepositos(): Observable<Deposito[]> {
    return this.http.get<Deposito[]>(`${this.depositosUrl}/`);
  }

  // ===============================================
  // � GESTIÓN DE SALDO
  // ===============================================

  /**
   * Ajustar saldo de caja chica
   * POST /caja-chica/ajustar-saldo
   */
  ajustarSaldo(ajuste: AjusteSaldo): Observable<ResumenCajaChica> {
    return this.http.post<ResumenCajaChica>(`${this.baseUrl}/caja-chica/ajustar-saldo`, ajuste);
  }

  // ===============================================
  // �🛠️ UTILIDADES
  // ===============================================

  /**
   * Validar formato de número de factura
   */
  validarNumeroFactura(numero: string): boolean {
    const patron = /^\d{3}-\d{3}-\d{7}$/;
    return patron.test(numero);
  }

  /**
   * Formatear número de factura para mostrar
   */
  formatearNumeroFactura(numero: string): string {
    if (!numero) return '';
    
    // Remover guiones si existen
    const limpio = numero.replace(/-/g, '');
    
    // Aplicar formato xxx-xxx-xxxxxxx
    if (limpio.length === 13) {
      return `${limpio.substring(0, 3)}-${limpio.substring(3, 6)}-${limpio.substring(6)}`;
    }
    
    return numero;
  }

  /**
   * Calcular total de productos en gasto
   */
  calcularTotalGasto(productos: { cantidad: number; precio_unitario: number }[]): number {
    return productos.reduce((total, producto) => {
      return total + (producto.cantidad * producto.precio_unitario);
    }, 0);
  }

  /**
   * Formatear moneda para mostrar
   */
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  /**
   * Formatear fecha para la API (yyyy-MM-dd)
   */
  formatearFechaApi(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Formatear fecha para mostrar (dd/MM/yyyy)
   */
  formatearFechaMostrar(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-UY');
  }

  /**
   * Obtener filtros de fechas para el mes actual
   */
  obtenerFiltrosMesActual(): FiltrosGastos {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const añoActual = hoy.getFullYear();
    
    return {
      mes: mesActual,
      año: añoActual,
      skip: 0,
      limit: 10
    };
  }

  /**
   * Obtener años disponibles para filtros
   */
  obtenerAñosDisponibles(): number[] {
    const añoActual = new Date().getFullYear();
    const años: number[] = [];
    
    // Desde 2020 hasta año actual + 1
    for (let año = 2020; año <= añoActual + 1; año++) {
      años.push(año);
    }
    
    return años.reverse(); // Más recientes primero
  }

  /**
   * Obtener meses del año para filtros
   */
  obtenerMesesAño(): { value: number; label: string }[] {
    return [
      { value: 1, label: 'Enero' },
      { value: 2, label: 'Febrero' },
      { value: 3, label: 'Marzo' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Mayo' },
      { value: 6, label: 'Junio' },
      { value: 7, label: 'Julio' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Septiembre' },
      { value: 10, label: 'Octubre' },
      { value: 11, label: 'Noviembre' },
      { value: 12, label: 'Diciembre' }
    ];
  }
}