import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StockMovimiento } from '../../models/stock.model';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.scss']
})
export class MovimientoFormComponent {
  @Input() movimiento: Partial<StockMovimiento> = { tipo: 'ingreso' };
  @Input() productos: any[] = [];
  @Input() depositos: any[] = [];
  @Output() save = new EventEmitter<Partial<StockMovimiento>>();
  @Output() cancel = new EventEmitter<void>();

  onSave() {
    this.save.emit(this.movimiento);
  }
}
