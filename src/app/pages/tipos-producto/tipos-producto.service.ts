import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TipoProducto {
  id: number;
  nombre: string;
}

export interface TipoProductoCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class TiposProductoService {
  private apiUrl = `${environment.apiUrl}/tipos_producto`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TipoProducto[]> {
    return this.http.get<TipoProducto[]>(`${this.apiUrl}/`);
  }

  create(tipo: TipoProductoCreate): Observable<TipoProducto> {
    return this.http.post<TipoProducto>(`${this.apiUrl}/`, tipo);
  }

  update(id: number, tipo: TipoProductoCreate): Observable<TipoProducto> {
    return this.http.put<TipoProducto>(`${this.apiUrl}/${id}`, tipo);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
