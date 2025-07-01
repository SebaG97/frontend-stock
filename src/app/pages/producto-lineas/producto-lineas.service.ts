import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductoLinea {
  id: number;
  nombre: string;
}

export interface ProductoLineaCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoLineasService {
  private apiUrl = `${environment.apiUrl}/producto_lineas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductoLinea[]> {
    return this.http.get<ProductoLinea[]>(`${this.apiUrl}/`);
  }

  create(linea: ProductoLineaCreate): Observable<ProductoLinea> {
    return this.http.post<ProductoLinea>(`${this.apiUrl}/`, linea);
  }

  update(id: number, linea: ProductoLineaCreate): Observable<ProductoLinea> {
    return this.http.put<ProductoLinea>(`${this.apiUrl}/${id}`, linea);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
