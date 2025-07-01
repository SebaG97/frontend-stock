import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Marca {
  id: number;
  nombre: string;
}

export interface MarcaCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class MarcasService {
  private apiUrl = `${environment.apiUrl}/marcas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}/`);
  }

  create(marca: MarcaCreate): Observable<Marca> {
    return this.http.post<Marca>(`${this.apiUrl}/`, marca);
  }

  update(id: number, marca: MarcaCreate): Observable<Marca> {
    return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
