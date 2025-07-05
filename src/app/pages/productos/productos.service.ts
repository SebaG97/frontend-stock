import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
  id: number;
  nombre: string;
  marca_id: number;
  rubro_id: number;
  tipo_producto_id: number;
  proveedor_id: number;
  // Agrega otros campos según tu modelo
}

export interface ProductoCreate {
  nombre: string;
  marca_id: number;
  rubro_id: number;
  tipo_producto_id: number;
  proveedor_id: number;
  // Agrega otros campos según tu modelo
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private apiUrl = environment.apiUrl + '/productos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl + '/');
  }

  create(data: ProductoCreate): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl + '/', data);
  }

  update(id: number, data: ProductoCreate): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
