import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Estado {
  id: number;
  nombre: string;
}

export interface EstadoCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class EstadosService {
  private apiUrl = `${environment.apiUrl}/estados`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.apiUrl}/`);
  }

  create(estado: EstadoCreate): Observable<Estado> {
    return this.http.post<Estado>(`${this.apiUrl}/`, estado);
  }

  update(id: number, estado: EstadoCreate): Observable<Estado> {
    return this.http.put<Estado>(`${this.apiUrl}/${id}`, estado);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
