// ...existing code...
import { Component, OnInit } from '@angular/core';
import { StockService } from './stock.service';
import { Stock } from '../../models/stock.model';
import { ProductoService } from './producto.service';
import { DepositoService } from './deposito.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
// import { StockFormComponent } from './stock-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CardModule, DialogModule, ButtonModule, ToastModule, DropdownModule, InputTextModule, MultiSelectModule],
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
  providers: [MessageService]
})
export class StockListComponent implements OnInit {
  maxStockMinimo(val: number): number {
    return Math.max(1, val * 0.1);
  }
  editarStockMinimo(row: any) {
    row.editandoStockMinimo = true;
    row.nuevoStockMinimo = row.stock_minimo;
  }

  cancelarEdicionStockMinimo(row: any) {
    row.editandoStockMinimo = false;
  }

  guardarStockMinimo(row: any) {
    const nuevoValor = Number(row.nuevoStockMinimo);
    if (isNaN(nuevoValor) || nuevoValor < 0) {
      this.messageService.add({severity:'warn', summary:'Valor inválido', detail:'El stock mínimo debe ser un número mayor o igual a 0'});
      return;
    }
    this.stockService.updateStock(row.id, { stock_minimo: nuevoValor }).subscribe({
      next: (resp) => {
        row.stock_minimo = nuevoValor;
        row.editandoStockMinimo = false;
        this.messageService.add({severity:'success', summary:'Actualizado', detail:'Stock mínimo actualizado'});
      },
      error: () => {
        this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo actualizar el stock mínimo'});
      }
    });
  }
// ...existing code...
  stock: Stock[] = [];
  filteredStock: Stock[] = [];
  loading = false;
  productos: any[] = [];
  depositos: any[] = [];
  filtroProducto: number[] = [];
  filtroDeposito: string = '';
  search: string = '';

  constructor(
    private stockService: StockService,
    private productoService: ProductoService,
    private depositoService: DepositoService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Cargar productos y depósitos antes de cargar stock para poder mapear nombres
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.depositoService.getDepositos().subscribe({
          next: (depositos) => {
            this.depositos = depositos;
            this.loadStock();
          },
          error: () => {
            this.depositos = [];
            this.loadStock();
          }
        });
      },
      error: () => {
        this.productos = [];
        this.depositoService.getDepositos().subscribe({
          next: (depositos) => {
            this.depositos = depositos;
            this.loadStock();
          },
          error: () => {
            this.depositos = [];
            this.loadStock();
          }
        });
      }
    });
  }

  loadStock() {
    this.loading = true;
    this.stockService.getStock().subscribe({
      next: (data) => {
        // Mapear producto y depósito por ID si no vienen anidados
        this.stock = data.map(item => ({
          ...item,
          producto: item.producto || this.productos.find(p => p.id === item.producto_id),
          deposito: item.deposito || this.depositos.find(d => d.id === item.deposito_id)
        }));
        this.filtrarStock();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filtrarStock() {
    // Asegura que filtroProducto siempre sea un array
    if (!Array.isArray(this.filtroProducto)) {
      this.filtroProducto = [];
    }
    this.filteredStock = this.stock.filter(item => {
      const coincideProducto = this.filtroProducto && this.filtroProducto.length > 0 ? this.filtroProducto.includes(Number(item.producto?.id)) : true;
      const coincideDeposito = this.filtroDeposito ? item.deposito?.id === Number(this.filtroDeposito) : true;
      const coincideBusqueda = this.search
        ? (item.producto?.descripcion?.toLowerCase().includes(this.search.toLowerCase()) ||
           item.deposito?.nombre?.toLowerCase().includes(this.search.toLowerCase()))
        : true;
      return coincideProducto && coincideDeposito && coincideBusqueda;
    });
  }

  get totalPorProducto() {
    // Si hay productos seleccionados, muestra el total solo de esos productos
    const ids = this.filtroProducto.length > 0 ? this.filtroProducto : [];
    const map = new Map<number, { producto: any, total: number }>();
    for (const item of this.filteredStock) {
      if (!item.producto) continue;
      const id = item.producto.id;
      if (ids.length > 0 && !ids.includes(id)) continue;
      if (!map.has(id)) {
        map.set(id, { producto: item.producto, total: 0 });
      }
      map.get(id)!.total += item.existencia || 0;
    }
    return Array.from(map.values());
  }






}
