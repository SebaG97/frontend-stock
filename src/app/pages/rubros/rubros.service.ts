import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rubro {
  id: number;
  nombre: string;
}

export interface RubroCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RubrosService {
  private apiUrl = `${environment.apiUrl}/rubros`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(`${this.apiUrl}/`);
  }

  create(rubro: RubroCreate): Observable<Rubro> {
    return this.http.post<Rubro>(`${this.apiUrl}/`, rubro);
  }

  update(id: number, rubro: RubroCreate): Observable<Rubro> {
    return this.http.put<Rubro>(`${this.apiUrl}/${id}`, rubro);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
