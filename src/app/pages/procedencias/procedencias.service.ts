import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Procedencia {
  id: number;
  nombre: string;
}

export interface ProcedenciaCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ProcedenciasService {
  private apiUrl = `${environment.apiUrl}/procedencias`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Procedencia[]> {
    return this.http.get<Procedencia[]>(`${this.apiUrl}/`);
  }

  create(procedencia: ProcedenciaCreate): Observable<Procedencia> {
    return this.http.post<Procedencia>(`${this.apiUrl}/`, procedencia);
  }

  update(id: number, procedencia: ProcedenciaCreate): Observable<Procedencia> {
    return this.http.put<Procedencia>(`${this.apiUrl}/${id}`, procedencia);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
