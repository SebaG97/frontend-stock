import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { StockMovimiento } from '../../models/stock.model';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface TipoMovimiento {
  code: string;
  name: string;
  description: string;
  tipo: 'entrada' | 'salida' | 'transferencia';
  icon: string;
  color: string;
  requiereDestino?: boolean;
}

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DropdownModule, ButtonModule, 
    InputTextModule, InputNumberModule, CardModule, DividerModule,
    TagModule, TooltipModule
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.scss']
})
export class MovimientoFormComponent implements OnInit {
  @Input() movimiento: Partial<StockMovimiento> = { tipo: 'ingreso' };
  @Input() productos: any[] = [];
  @Input() depositos: any[] = [];
  @Output() save = new EventEmitter<Partial<StockMovimiento>>();
  @Output() cancel = new EventEmitter<void>();

  tiposMovimiento: TipoMovimiento[] = [
    {
      code: 'entrada_compra',
      name: 'Entrada por compra',
      description: 'Ingreso de productos nuevos al inventario',
      tipo: 'entrada',
      icon: 'pi pi-shopping-cart',
      color: 'success'
    },
    {
      code: 'transferencia_deposito',
      name: 'Transferencia entre depósitos',
      description: 'Mover productos de un depósito a otro',
      tipo: 'transferencia',
      icon: 'pi pi-arrow-right-arrow-left',
      color: 'info',
      requiereDestino: true
    },
    {
      code: 'salida_orden_trabajo',
      name: 'Salida por orden de trabajo',
      description: 'Productos utilizados en trabajos',
      tipo: 'salida',
      icon: 'pi pi-wrench',
      color: 'warning'
    },
    {
      code: 'ajuste_faltante',
      name: 'Ajuste por faltante',
      description: 'Corrección por productos faltantes',
      tipo: 'salida',
      icon: 'pi pi-minus-circle',
      color: 'danger'
    },
    {
      code: 'ajuste_sobrante',
      name: 'Ajuste por sobrante',
      description: 'Corrección por productos sobrantes',
      tipo: 'entrada',
      icon: 'pi pi-plus-circle',
      color: 'success'
    },
    {
      code: 'dado_baja',
      name: 'Dado de baja',
      description: 'Productos retirados definitivamente',
      tipo: 'salida',
      icon: 'pi pi-trash',
      color: 'danger'
    }
  ];

  tipoMovimientoSeleccionado: TipoMovimiento | null = null;
  depositoDestino: any = null;

  ngOnInit() {
    // Inicializar tipo de movimiento si existe
    if (this.movimiento.motivo) {
      this.tipoMovimientoSeleccionado = this.tiposMovimiento.find(t => t.code === this.movimiento.motivo) || null;
    }
  }

  onTipoMovimientoChange(tipoMovimiento: TipoMovimiento) {
    this.tipoMovimientoSeleccionado = tipoMovimiento;
    this.movimiento.motivo = tipoMovimiento.code;
    
    // Establecer el tipo según la categoría
    switch (tipoMovimiento.tipo) {
      case 'entrada':
        this.movimiento.tipo = 'ingreso';
        break;
      case 'salida':
        this.movimiento.tipo = 'egreso';
        break;
      case 'transferencia':
        this.movimiento.tipo = 'ajuste'; // Para transferencias usamos ajuste
        break;
    }
    
    // Limpiar depósito destino si no es transferencia
    if (!tipoMovimiento.requiereDestino) {
      this.depositoDestino = null;
    }
  }

  get productoSeleccionado() {
    return this.productos.find(p => p.id === this.movimiento.producto_id);
  }

  get depositoOrigenSeleccionado() {
    return this.depositos.find(d => d.id === this.movimiento.deposito_id);
  }

  get depositoDestinoSeleccionado() {
    return this.depositos.find(d => d.id === this.depositoDestino?.id);
  }

  get esTransferencia() {
    return this.tipoMovimientoSeleccionado?.requiereDestino || false;
  }

  get depositosDisponiblesDestino() {
    // Para transferencias, excluir el depósito origen
    return this.depositos.filter(d => d.id !== this.movimiento.deposito_id);
  }

  onSave() {
    // Para transferencias, necesitamos crear movimientos de salida y entrada
    if (this.esTransferencia && this.depositoDestino) {
      // Emitir los datos incluyendo el depósito destino para que el componente padre maneje la lógica
      const movimientoCompleto = {
        ...this.movimiento,
        deposito_destino_id: this.depositoDestino.id,
        es_transferencia: true
      };
      this.save.emit(movimientoCompleto);
    } else {
      this.save.emit(this.movimiento);
    }
  }

  getSeverityForTipo(tipo: string): string {
    switch (tipo) {
      case 'entrada': return 'success';
      case 'salida': return 'warning';
      case 'transferencia': return 'info';
      default: return 'secondary';
    }
  }

  getFormValidation(): boolean {
    const baseValid = !!(
      this.movimiento.producto_id && 
      this.movimiento.deposito_id && 
      this.movimiento.cantidad && 
      this.movimiento.cantidad > 0 &&
      this.tipoMovimientoSeleccionado
    );

    if (this.esTransferencia) {
      return baseValid && !!this.depositoDestino && this.depositoDestino.id !== this.movimiento.deposito_id;
    }

    return baseValid;
  }
}
