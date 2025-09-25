import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import { 
  MovimientoMultiple, 
  TransferenciaMultiple, 
  ItemMovimiento, 
  ItemTransferencia,
  Producto,
  Deposito 
} from '../../models/stock.model';

interface TipoMovimientoMultiple {
  code: string;
  name: string;
  description: string;
  tipo: 'entrada' | 'salida' | 'transferencia';
  icon: string;
  color: string;
  requiereDestino: boolean;
}

@Component({
  selector: 'app-movimiento-multiple-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule, DropdownModule,
    InputNumberModule, TableModule, TagModule, DividerModule, TooltipModule, InputTextModule
  ],
  templateUrl: './movimiento-multiple-form.component.html',
  styleUrls: ['./movimiento-multiple-form.component.scss']
})
export class MovimientoMultipleFormComponent implements OnInit {
  @Input() productos: Producto[] = [];
  @Input() depositos: Deposito[] = [];
  @Output() save = new EventEmitter<MovimientoMultiple | TransferenciaMultiple>();
  @Output() cancel = new EventEmitter<void>();

  // Configuración del formulario
  tipoMovimientoSeleccionado: TipoMovimientoMultiple | null = null;
  depositoOrigen: Deposito | null = null;
  depositoDestino: Deposito | null = null;
  observaciones: string = '';

  // Items del movimiento
  items: (ItemMovimiento | ItemTransferencia)[] = [];
  
  // Item temporal para agregar
  productoSeleccionado: Producto | null = null;
  cantidadSeleccionada: number = 1;

  tiposMovimiento: TipoMovimientoMultiple[] = [
    {
      code: 'compra',
      name: 'Compra Múltiple',
      description: 'Entrada de múltiples productos por compra',
      tipo: 'entrada',
      icon: 'pi pi-shopping-cart',
      color: 'green',
      requiereDestino: false
    },
    {
      code: 'venta',
      name: 'Venta Múltiple',
      description: 'Salida de múltiples productos por venta',
      tipo: 'salida',
      icon: 'pi pi-money-bill',
      color: 'orange',
      requiereDestino: false
    },
    {
      code: 'ajuste_positivo',
      name: 'Ajuste Positivo Múltiple',
      description: 'Ajuste positivo de múltiples productos',
      tipo: 'entrada',
      icon: 'pi pi-plus-circle',
      color: 'green',
      requiereDestino: false
    },
    {
      code: 'ajuste_negativo',
      name: 'Ajuste Negativo Múltiple',
      description: 'Ajuste negativo de múltiples productos',
      tipo: 'salida',
      icon: 'pi pi-minus-circle',
      color: 'red',
      requiereDestino: false
    },
    {
      code: 'transferencia_deposito',
      name: 'Transferencia Múltiple',
      description: 'Transferencia de múltiples productos entre depósitos',
      tipo: 'transferencia',
      icon: 'pi pi-arrow-right-arrow-left',
      color: 'blue',
      requiereDestino: true
    }
  ];

  ngOnInit() {}

  onTipoMovimientoChange(tipoMovimiento: TipoMovimientoMultiple) {
    this.tipoMovimientoSeleccionado = tipoMovimiento;
    
    // Limpiar depósito destino si no es transferencia
    if (!tipoMovimiento.requiereDestino) {
      this.depositoDestino = null;
    }
    
    // Limpiar items al cambiar tipo
    this.items = [];
  }

  get esTransferencia(): boolean {
    return this.tipoMovimientoSeleccionado?.requiereDestino || false;
  }

  get depositosDisponiblesDestino(): Deposito[] {
    return this.depositos.filter(d => d.id !== this.depositoOrigen?.id);
  }

  get productosDisponibles(): Producto[] {
    const productosUsados = this.items.map(item => item.producto_id);
    return this.productos.filter(p => !productosUsados.includes(p.id));
  }

  agregarItem() {
    if (!this.productoSeleccionado || !this.cantidadSeleccionada || this.cantidadSeleccionada <= 0) {
      return;
    }

    const nuevoItem: ItemMovimiento | ItemTransferencia = {
      producto_id: this.productoSeleccionado.id,
      cantidad: this.cantidadSeleccionada,
      producto: this.productoSeleccionado
    };

    this.items.push(nuevoItem);
    
    // Limpiar selección
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
  }

  eliminarItem(index: number) {
    this.items.splice(index, 1);
  }

  get totalProductos(): number {
    return this.items.length;
  }

  get totalCantidad(): number {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  getSeverityForTipo(tipo: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (tipo) {
      case 'entrada': return 'success';
      case 'salida': return 'warning';
      case 'transferencia': return 'info';
      default: return 'secondary';
    }
  }

  getFormValidation(): boolean {
    const baseValid = !!(
      this.tipoMovimientoSeleccionado && 
      this.depositoOrigen &&
      this.items.length > 0
    );

    if (this.esTransferencia) {
      return baseValid && !!this.depositoDestino && this.depositoDestino.id !== this.depositoOrigen?.id;
    }

    return baseValid;
  }

  onSave() {
    if (!this.getFormValidation()) {
      return;
    }

    if (this.esTransferencia && this.depositoDestino) {
      const transferencia: TransferenciaMultiple = {
        deposito_origen_id: this.depositoOrigen!.id,
        deposito_destino_id: this.depositoDestino.id,
        motivo: this.tipoMovimientoSeleccionado!.code,
        observaciones: this.observaciones || undefined,
        items: this.items as ItemTransferencia[]
      };
      this.save.emit(transferencia);
    } else {
      const movimiento: MovimientoMultiple = {
        deposito_id: this.depositoOrigen!.id,
        tipo: this.tipoMovimientoSeleccionado!.tipo === 'entrada' ? 'ingreso' : 'egreso',
        motivo: this.tipoMovimientoSeleccionado!.code,
        observaciones: this.observaciones || undefined,
        items: this.items as ItemMovimiento[]
      };
      this.save.emit(movimiento);
    }
  }
}