import { Component } from '@angular/core';
import { StockService } from './stock.service';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-stock-sync',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './stock-sync.component.html',
  styleUrls: ['./stock-sync.component.scss']
})
export class StockSyncComponent {
  loading = false;
  message = '';

  constructor(private stockService: StockService) {}

  sync() {
    this.loading = true;
    this.message = '';
    console.log('Iniciando sincronización de stock...');
    this.stockService.syncOrdenes().subscribe({
      next: (resp) => {
        console.log('Respuesta de sincronización:', resp);
        this.message = 'Sincronización exitosa';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al sincronizar:', err);
        this.message = 'Error al sincronizar';
        this.loading = false;
      }
    });
  }
}
