import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Deposito } from '../../models/stock.model';

@Injectable({ providedIn: 'root' })
export class DepositoService {
  private apiUrl = `${environment.apiUrl}/depositos`;

  constructor(private http: HttpClient) {}

  getDepositos(): Observable<Deposito[]> {
    return this.http.get<Deposito[]>(this.apiUrl);
  }
}
