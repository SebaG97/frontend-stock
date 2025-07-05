// ...existing code...
import { Component, OnInit } from '@angular/core';
import { ProductosService, Producto } from './productos.service';
import { MarcasService, Marca } from '../marcas/marcas.service';
import { RubrosService, Rubro } from '../rubros/rubros.service';
import { TiposProductoService, TipoProducto } from '../tipos-producto/tipos-producto.service';
import { ProveedoresService, Proveedor } from '../proveedores/proveedores.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  selectedProductos: Producto[] = [];
  producto: any = {};
  productoDialog = false;
  submitted = false;
  loading = false;
  editId: number | null = null;

  marcas: Marca[] = [];
  rubros: Rubro[] = [];
  tiposProducto: TipoProducto[] = [];
  proveedores: Proveedor[] = [];

  constructor(
    private productosService: ProductosService,
    private marcasService: MarcasService,
    private rubrosService: RubrosService,
    private tiposProductoService: TiposProductoService,
    private proveedoresService: ProveedoresService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.load();
    this.marcasService.getAll().subscribe(data => this.marcas = data);
    this.rubrosService.getAll().subscribe(data => this.rubros = data);
    this.tiposProductoService.getAll().subscribe(data => this.tiposProducto = data);
    this.proveedoresService.getAll().subscribe(data => this.proveedores = data);
  }

  load() {
    this.loading = true;
    this.productosService.getAll().subscribe({
      next: data => {
        this.productos = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.producto = {};
    this.editId = null;
    this.submitted = false;
    this.productoDialog = true;
  }

  editProducto(producto: Producto) {
    this.producto = { ...producto };
    this.editId = producto.id;
    this.productoDialog = true;
    this.submitted = false;
  }

  saveProducto() {
    this.submitted = true;
    if (!this.producto.descripcion) return;
    if (this.editId) {
      this.productosService.update(this.editId, this.producto as any).subscribe(() => {
        this.productoDialog = false;
        this.editId = null;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente' });
      });
    } else {
      this.productosService.create(this.producto as any).subscribe(() => {
        this.productoDialog = false;
        this.load();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente' });
      });
    }
  }

  deleteProducto(producto: Producto) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el producto "${producto.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productosService.delete(producto.id).subscribe(() => {
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Producto eliminado correctamente' });
        });
      }
    });
  }

  deleteSelectedProductos() {
    if (!this.selectedProductos?.length) return;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar los productos seleccionados?`,
      header: 'Confirmar eliminación múltiple',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletes = this.selectedProductos.map(prod => this.productosService.delete(prod.id));
        Promise.all(deletes.map(obs => obs.toPromise())).then(() => {
          this.selectedProductos = [];
          this.load();
          this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Productos eliminados correctamente' });
        });
      }
    });
  }

  hideDialog() {
    this.productoDialog = false;
    this.editId = null;
    this.producto = {};
    this.submitted = false;
  }

  onSelectionChange(event: any) {
    this.selectedProductos = event;
  }

  getMarcaNombre(id: number | undefined): string {
    return this.marcas.find(m => m.id === id)?.nombre || '';
  }

  getRubroNombre(id: number | undefined): string {
    return this.rubros.find(r => r.id === id)?.nombre || '';
  }

  getTipoProductoNombre(id: number | undefined): string {
    return this.tiposProducto.find(t => t.id === id)?.nombre || '';
  }

  getProveedorNombre(id: number | undefined): string {
    return this.proveedores.find(p => p.id === id)?.nombre || '';
  }
}
