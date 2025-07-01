import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Deposito {
  id: number;
  nombre: string;
}

export interface DepositoCreate {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class DepositosService {
  private apiUrl = `${environment.apiUrl}/depositos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Deposito[]> {
    return this.http.get<Deposito[]>(`${this.apiUrl}/`);
  }

  create(deposito: DepositoCreate): Observable<Deposito> {
    return this.http.post<Deposito>(`${this.apiUrl}/`, deposito);
  }

  update(id: number, deposito: DepositoCreate): Observable<Deposito> {
    return this.http.put<Deposito>(`${this.apiUrl}/${id}`, deposito);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
