import { Component, OnInit } from '@angular/core';
import { StockService } from './stock.service';
import { 
  StockMovimiento,
  MovimientoMultiple,
  TransferenciaMultiple,
  RespuestaMovimientoMultiple,
  RespuestaTransferenciaMultiple
} from '../../models/stock.model';
import { ProductoService } from './producto.service';
import { DepositoService } from './deposito.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MovimientoFormComponent } from './movimiento-form.component';
import { MovimientoMultipleFormComponent } from './movimiento-multiple-form.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-stock-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CardModule, DialogModule, ButtonModule, TagModule, MovimientoFormComponent, MovimientoMultipleFormComponent, ToastModule],
  templateUrl: './stock-movimientos.component.html',
  styleUrls: ['./stock-movimientos.component.scss'],
  providers: [MessageService]
})
export class StockMovimientosComponent implements OnInit {
  movimientos: StockMovimiento[] = [];
  loading = false;
  showDialog = false;
  esMovimientoMultiple = false;
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

  openNew(esMultiple: boolean = false) {
    this.esMovimientoMultiple = esMultiple;
    this.selectedMovimiento = { tipo: 'ingreso' };
    this.showDialog = true;
  }

  onSave(movimiento: any) {
    let obs$;
    
    // ✅ Usar el nuevo endpoint específico para transferencias
    if (movimiento.es_transferencia && movimiento.deposito_destino_id) {
      const transferenciaPayload = {
        producto_id: movimiento.producto_id,
        deposito_origen_id: movimiento.deposito_id,
        deposito_destino_id: movimiento.deposito_destino_id,
        cantidad: movimiento.cantidad,
        motivo: movimiento.motivo || 'transferencia_deposito'
      };
      obs$ = this.stockService.transferenciaMovimiento(transferenciaPayload);
    } else if (movimiento.tipo === 'ingreso') {
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
        this.messageService.add({
          severity:'success', 
          summary:'Éxito', 
          detail: movimiento.es_transferencia ? 'Transferencia realizada correctamente' : 'Movimiento registrado correctamente'
        });
      },
      error: (err) => {
        this.showDialog = false;
        this.messageService.add({
          severity:'error', 
          summary:'Error', 
          detail: err?.error?.detail || 'No se pudo registrar el movimiento'
        });
      }
    });
  }

  // ✅ Método para guardar movimientos múltiples
  onSaveMultiple(payload: MovimientoMultiple | TransferenciaMultiple) {
    // Verificar si es transferencia múltiple
    if ('deposito_destino_id' in payload) {
      const transferencia = payload as TransferenciaMultiple;
      this.stockService.transferenciaMultiple(transferencia).subscribe({
        next: (response: RespuestaTransferenciaMultiple) => {
          this.handleMultipleResponse(response, true);
        },
        error: (err: any) => {
          this.handleMultipleError(err);
        }
      });
    } else {
      const movimiento = payload as MovimientoMultiple;
      this.stockService.movimientoMultiple(movimiento).subscribe({
        next: (response: RespuestaMovimientoMultiple) => {
          this.handleMultipleResponse(response, false);
        },
        error: (err: any) => {
          this.handleMultipleError(err);
        }
      });
    }
  }

  private handleMultipleResponse(response: RespuestaMovimientoMultiple | RespuestaTransferenciaMultiple, esTransferencia: boolean) {
    this.showDialog = false;
    this.esMovimientoMultiple = false;
    this.loadMovimientos();
    
    // Mostrar resultado detallado
    const mensajeExito = esTransferencia ? 
      `Transferencia múltiple completada: ${response.items_exitosos}/${response.total_items} productos` :
      `Movimiento múltiple completado: ${response.items_exitosos}/${response.total_items} productos`;
      
    this.messageService.add({
      severity: response.items_fallidos > 0 ? 'warning' : 'success',
      summary: response.items_fallidos > 0 ? 'Completado con errores' : 'Éxito',
      detail: mensajeExito,
      life: 5000
    });
    
    // Mostrar errores específicos si los hay
    if (response.items_fallidos > 0) {
      response.resultados.forEach((resultado: any) => {
        if (!resultado.exito) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error en producto',
            detail: `${resultado.producto?.descripcion}: ${resultado.mensaje}`,
            life: 8000
          });
        }
      });
    }
  }

  private handleMultipleError(err: any) {
    this.showDialog = false;
    this.esMovimientoMultiple = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.error?.detail || 'No se pudo realizar la operación múltiple'
    });
  }

  onCancel() {
    this.showDialog = false;
    this.esMovimientoMultiple = false;
  }

  // ✅ Métodos para etiquetas y visualización mejorada
  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'ingreso': return 'ENTRADA';
      case 'egreso': return 'SALIDA';
      case 'ajuste': return 'AJUSTE';
      default: return tipo?.toUpperCase() || 'N/A';
    }
  }

  getTipoSeverity(tipo: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (tipo) {
      case 'ingreso': return 'success';
      case 'egreso': return 'warning';
      case 'ajuste': return 'info';
      default: return 'secondary';
    }
  }

  getTipoIconClass(tipo: string): string {
    switch (tipo) {
      case 'ingreso': return 'pi pi-arrow-down';
      case 'egreso': return 'pi pi-arrow-up';
      case 'ajuste': return 'pi pi-wrench';
      default: return 'pi pi-circle';
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'ingreso': return '+';
      case 'egreso': return '-';
      case 'ajuste': return '±';
      default: return '';
    }
  }

  getCantidadClass(tipo: string): string {
    switch (tipo) {
      case 'ingreso': return 'text-green-600';
      case 'egreso': return 'text-red-600';
      case 'ajuste': return 'text-blue-600';
      default: return 'text-600';
    }
  }

  getMotivoLabel(motivo: string): string {
    switch (motivo) {
      case 'compra': return 'Compra';
      case 'venta': return 'Venta';
      case 'devolucion': return 'Devolución';
      case 'ajuste_positivo': return 'Ajuste +';
      case 'ajuste_negativo': return 'Ajuste -';
      case 'transferencia_deposito': return 'Transferencia';
      default: return motivo || 'Otro';
    }
  }

  getMotivoSeverity(motivo: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (motivo) {
      case 'compra': return 'success';
      case 'venta': return 'warning';
      case 'devolucion': return 'danger';
      case 'ajuste_positivo': return 'success';
      case 'ajuste_negativo': return 'warning';
      case 'transferencia_deposito': return 'info';
      default: return 'secondary';
    }
  }

  // ✅ Métodos para identificar transferencias
  esTransferencia(movimiento: any): boolean {
    return movimiento.motivo === 'transferencia_deposito';
  }

  getTransferenciaLabel(movimiento: any): string {
    return movimiento.tipo === 'egreso' ? 'ORIGEN' : 'DESTINO';
  }

  getTransferenciaVinculada(movimiento: any): string {
    if (!this.esTransferencia(movimiento)) {
      return '';
    }

    // Buscar el movimiento relacionado de la transferencia
    const movimientoRelacionado = this.findMovimientoRelacionado(movimiento);
    
    if (movimientoRelacionado) {
      return `#${movimientoRelacionado.id}`;
    }
    
    return 'No encontrado';
  }

  // ✅ Buscar el movimiento relacionado en una transferencia
  private findMovimientoRelacionado(movimiento: any): any {
    // Los movimientos de transferencia tienen el mismo producto, cantidad y fecha cercana
    // pero diferentes depósitos y tipos opuestos
    const tipoOpuesto = movimiento.tipo === 'egreso' ? 'ingreso' : 'egreso';
    
    return this.movimientos.find(m => 
      m.id !== movimiento.id && // No el mismo movimiento
      m.motivo === 'transferencia_deposito' && // Es transferencia
      m.tipo === tipoOpuesto && // Tipo opuesto
      m.producto_id === movimiento.producto_id && // Mismo producto
      Math.abs(m.cantidad - movimiento.cantidad) < 0.01 && // Misma cantidad (con tolerancia decimal)
      m.deposito_id !== movimiento.deposito_id && // Diferente depósito
      this.esMismaFecha(m.fecha, movimiento.fecha) // Misma fecha (o muy cercana)
    );
  }

  // ✅ Verificar si dos fechas son del mismo día o muy cercanas
  private esMismaFecha(fecha1: string, fecha2: string): boolean {
    const date1 = new Date(fecha1);
    const date2 = new Date(fecha2);
    const diffInMinutes = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60);
    return diffInMinutes <= 5; // Dentro de 5 minutos
  }

  getRowClass(movimiento: any): string {
    if (this.esTransferencia(movimiento)) {
      return movimiento.tipo === 'egreso' ? 'transfer-row-origen' : 'transfer-row-destino';
    }
    return '';
  }

  // ✅ Obtener información del depósito relacionado
  getMovimientoRelacionadoInfo(movimiento: any): { deposito: string } | null {
    const relacionado = this.findMovimientoRelacionado(movimiento);
    if (relacionado && relacionado.deposito) {
      return {
        deposito: relacionado.deposito.nombre
      };
    }
    return null;
  }
}
