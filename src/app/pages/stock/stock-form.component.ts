import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Stock } from '../../models/stock.model';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule],
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss']
})
export class StockFormComponent {
  @Input() stock: Partial<Stock> = {};
  @Input() productos: any[] = [];
  @Input() depositos: any[] = [];
  @Output() save = new EventEmitter<Partial<Stock>>();
  @Output() cancel = new EventEmitter<void>();

  onSave() {
    this.save.emit(this.stock);
  }
}
