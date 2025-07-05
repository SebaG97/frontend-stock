import { Component, OnInit } from '@angular/core';
import { StockService } from './stock/stock.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, ButtonModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stock: any[] = [];
  loading = false;
  alertas: any[] = [];

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  constructor(private stockService: StockService, private router: Router) {}

  ngOnInit() {
    this.cargarStock();
  }

  cargarStock() {
    this.loading = true;
    this.stockService.getStock().subscribe({
      next: (data: any[]) => {
        this.stock = data;
        this.alertas = data.filter((item: any) => item.existencia <= item.stock_minimo || (item.existencia > item.stock_minimo && item.existencia <= item.stock_minimo + Math.max(1, item.stock_minimo * 0.1)));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  irAStock() {
    this.router.navigate(['/stock']);
  }

  irAMovimientos() {
    this.router.navigate(['/stock-movimientos']);
  }
}
