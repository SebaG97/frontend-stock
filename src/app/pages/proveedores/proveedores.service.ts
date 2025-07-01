import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface ProveedorCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/`);
  }

  create(proveedor: ProveedorCreate): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/`, proveedor);
  }

  update(id: number, proveedor: ProveedorCreate): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
