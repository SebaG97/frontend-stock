import { Component, OnInit } from '@angular/core';
import { StockService } from './stock.service';
import { StockMovimiento } from '../../models/stock.model';
import { ProductoService } from './producto.service';
import { DepositoService } from './deposito.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MovimientoFormComponent } from './movimiento-form.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-stock-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CardModule, DialogModule, ButtonModule, MovimientoFormComponent, ToastModule],
  templateUrl: './stock-movimientos.component.html',
  styleUrls: ['./stock-movimientos.component.scss'],
  providers: [MessageService]
})
export class StockMovimientosComponent implements OnInit {
  movimientos: StockMovimiento[] = [];
  loading = false;
  showDialog = false;
  selectedMovimiento: Partial<StockMovimiento> = {};
  productos: any[] = [];
  depositos: any[] = [];

  constructor(
    private stockService: StockService,
    private productoService: ProductoService,
    private depositoService: DepositoService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Cargar productos y depósitos antes de cargar movimientos para mapear nombres correctamente
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.depositoService.getDepositos().subscribe({
          next: (depositos) => {
            this.depositos = depositos;
            this.loadMovimientos();
          },
          error: () => {
            this.depositos = [];
            this.loadMovimientos();
          }
        });
      },
      error: () => {
        this.productos = [];
        this.depositoService.getDepositos().subscribe({
          next: (depositos) => {
            this.depositos = depositos;
            this.loadMovimientos();
          },
          error: () => {
            this.depositos = [];
            this.loadMovimientos();
          }
        });
      }
    });
  }

  loadMovimientos() {
    this.loading = true;
    this.stockService.getMovimientos().subscribe({
      next: (data) => {
        // Si el backend no trae producto/deposito anidados, los mapeamos aquí
        this.movimientos = data.map(mov => ({
          ...mov,
          producto: mov.producto || this.productos.find(p => p.id === mov.producto_id),
          deposito: mov.deposito || this.depositos.find(d => d.id === mov.deposito_id)
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.selectedMovimiento = { tipo: 'ingreso' };
    this.showDialog = true;
  }

  onSave(movimiento: Partial<StockMovimiento>) {
    let obs$;
    if (movimiento.tipo === 'ingreso') {
      obs$ = this.stockService.ingresoMovimiento(movimiento);
    } else if (movimiento.tipo === 'egreso') {
      obs$ = this.stockService.egresoMovimiento(movimiento);
    } else {
      obs$ = this.stockService.ajusteMovimiento(movimiento);
    }
    obs$.subscribe({
      next: () => {
        this.showDialog = false;
        this.loadMovimientos();
        this.messageService.add({severity:'success', summary:'Éxito', detail:'Movimiento registrado correctamente'});
      },
      error: (err) => {
        this.showDialog = false;
        this.messageService.add({severity:'error', summary:'Error', detail: err?.error?.detail || 'No se pudo registrar el movimiento'});
      }
    });
  }

  onCancel() {
    this.showDialog = false;
  }
}
