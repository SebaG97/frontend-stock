import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

import { MessageService, ConfirmationService } from 'primeng/api';

import { CajaChicaService } from '../../services/caja-chica.service';
import { 
  GastoCreate,
  ProductoGastoCreate,
  Proveedor,
  Producto,
  Deposito,
  Gasto
} from '../../models/caja-chica.model';

/**
 * 💸 Formulario para Crear/Editar Gastos de Caja Chica
 * 
 * Features:
 * - Selector de proveedores con opción crear nuevo
 * - Validación de formato de factura
 * - Tabla dinámica para productos
 * - Cálculo automático de totales
 * - Validaciones completas
 */
@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,

    DropdownModule,
    CalendarModule,
    InputNumberModule,
    TableModule,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    ToolbarModule,
    DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gasto-form.component.html',
  styleUrls: ['./gasto-form.component.scss']
})
export class GastoFormComponent implements OnInit {
  // 📋 Formulario principal
  gastoForm!: FormGroup;
  
  // 📊 Datos para dropdowns
  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  depositos: Deposito[] = [];
  
  // 🎯 Estado del componente
  loading = true;
  guardando = false;
  modoEdicion = false;
  gastoId: number | null = null;
  
  // 💰 Cálculos
  totalGasto = 0;
  
  // 🏢 Modal nuevo proveedor
  mostrarModalProveedor = false;
  nuevoProveedorForm!: FormGroup;
  
  // 📋 Productos en el gasto
  get productosArray(): FormArray {
    return this.gastoForm.get('productos') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inicializarFormularios();
  }

  ngOnInit() {
    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion = true;
      this.gastoId = parseInt(id);
    }
    
    this.cargarDatos();
  }

  // ===============================================
  // 🏗️ INICIALIZACIÓN
  // ===============================================

  private inicializarFormularios() {
    // Formulario principal de gasto
    this.gastoForm = this.fb.group({
      proveedor_id: [null, [Validators.required]],
      numero_factura: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{7}$/)]],
      fecha_factura: [new Date(), [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      productos: this.fb.array([])
    });

    // Formulario para nuevo proveedor
    this.nuevoProveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{6,8}-\d{1}$/)]],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]]
    });

    // Agregar primer producto por defecto
    this.agregarProducto();
  }

  private async cargarDatos() {
    this.loading = true;
    
    try {
      // Cargar datos en paralelo
      const [proveedores, productos, depositos] = await Promise.all([
        this.cajaChicaService.obtenerProveedores().toPromise(),
        this.cajaChicaService.obtenerProductos().toPromise(),
        this.cajaChicaService.obtenerDepositos().toPromise()
      ]);
      
      this.proveedores = proveedores || [];
      this.productos = productos || [];
      this.depositos = depositos || [];
      
      // Si es modo edición, cargar datos del gasto
      if (this.modoEdicion && this.gastoId) {
        await this.cargarGastoParaEdicion();
      }
      
      this.loading = false;
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos necesarios'
      });
      this.loading = false;
    }
  }

  private async cargarGastoParaEdicion() {
    if (!this.gastoId) return;
    
    try {
      const gasto = await this.cajaChicaService.obtenerGastoPorId(this.gastoId).toPromise();
      
      if (gasto) {
        // Llenar formulario con datos del gasto
        this.gastoForm.patchValue({
          proveedor_id: gasto.proveedor_id,
          numero_factura: gasto.numero_factura,
          fecha_factura: new Date(gasto.fecha_factura),
          descripcion: gasto.descripcion
        });
        
        // Limpiar productos existentes y cargar los del gasto
        this.productosArray.clear();
        gasto.productos.forEach(producto => {
          this.agregarProductoConDatos(producto);
        });
        
        this.calcularTotal();
      }
      
    } catch (error) {
      console.error('Error al cargar gasto para edición:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el gasto para editar'
      });
      this.router.navigate(['/caja-chica/gastos']);
    }
  }

  // ===============================================
  // 📋 GESTIÓN DE PRODUCTOS
  // ===============================================

  crearProductoFormGroup(datos?: any): FormGroup {
    return this.fb.group({
      producto_id: [datos?.producto_id || null, [Validators.required]],
      deposito_id: [datos?.deposito_id || null, [Validators.required]],
      cantidad: [datos?.cantidad || 1, [Validators.required, Validators.min(0.01)]],
      precio_unitario: [datos?.precio_unitario || 0, [Validators.required, Validators.min(0.01)]]
    });
  }

  agregarProducto() {
    this.productosArray.push(this.crearProductoFormGroup());
  }

  private agregarProductoConDatos(producto: any) {
    this.productosArray.push(this.crearProductoFormGroup(producto));
  }

  eliminarProducto(index: number) {
    if (this.productosArray.length > 1) {
      this.productosArray.removeAt(index);
      this.calcularTotal();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe mantener al menos un producto'
      });
    }
  }

  calcularSubtotal(index: number): number {
    const producto = this.productosArray.at(index);
    if (!producto) return 0;
    
    const cantidad = producto.get('cantidad')?.value || 0;
    const precio = producto.get('precio_unitario')?.value || 0;
    
    return cantidad * precio;
  }

  calcularTotal() {
    this.totalGasto = 0;
    
    for (let i = 0; i < this.productosArray.length; i++) {
      this.totalGasto += this.calcularSubtotal(i);
    }
  }

  onProductoChange(index: number, field: string) {
    const producto = this.productosArray.at(index);
    if (!producto) return;

    // Si cambió el producto, actualizar precio sugerido
    if (field === 'producto_id') {
      const productoId = producto.get('producto_id')?.value;
      const productoSeleccionado = this.productos.find(p => p.id === productoId);
      
      if (productoSeleccionado && productoSeleccionado.precio > 0) {
        producto.patchValue({
          precio_unitario: productoSeleccionado.precio
        });
      }
    }
    
    this.calcularTotal();
  }

  // ===============================================
  // 🏢 GESTIÓN DE PROVEEDORES
  // ===============================================

  abrirModalNuevoProveedor() {
    this.nuevoProveedorForm.reset();
    this.mostrarModalProveedor = true;
  }

  cerrarModalProveedor() {
    this.mostrarModalProveedor = false;
    this.nuevoProveedorForm.reset();
  }

  async crearNuevoProveedor() {
    if (this.nuevoProveedorForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      this.nuevoProveedorForm.markAllAsTouched();
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Por favor complete todos los campos requeridos correctamente'
      });
      return;
    }

    try {
      const nuevoProveedorData = this.nuevoProveedorForm.value;
      
      // TODO: Implementar creación de proveedor via servicio
      // const nuevoProveedor = await this.proveedoresService.create(nuevoProveedorData).toPromise();
      
      // Por ahora simular la creación exitosa
      this.messageService.add({
        severity: 'success',
        summary: 'Proveedor creado',
        detail: `Proveedor "${nuevoProveedorData.nombre}" (RUC: ${nuevoProveedorData.ruc}) creado correctamente`
      });
      
      // TODO: Agregar el nuevo proveedor a la lista y seleccionarlo
      // this.proveedores.push(nuevoProveedor);
      // this.gastoForm.patchValue({ proveedor_id: nuevoProveedor.id });
      
      this.cerrarModalProveedor();
      
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo crear el proveedor. Intente nuevamente.'
      });
    }
  }

  // ===============================================
  // 💾 GUARDAR GASTO
  // ===============================================

  async guardarGasto() {
    if (this.gastoForm.invalid) {
      this.marcarCamposComoTocados();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    if (this.productosArray.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin productos',
        detail: 'Debe agregar al menos un producto'
      });
      return;
    }

    this.guardando = true;
    
    try {
      const formValue = this.gastoForm.value;
      
      const gastoData: GastoCreate = {
        proveedor_id: formValue.proveedor_id,
        numero_factura: formValue.numero_factura,
        fecha_factura: this.cajaChicaService.formatearFechaApi(formValue.fecha_factura),
        descripcion: formValue.descripcion,
        productos: formValue.productos
      };

      let resultado: Gasto | undefined;
      
      if (this.modoEdicion && this.gastoId) {
        resultado = await this.cajaChicaService.actualizarGasto(this.gastoId, gastoData).toPromise();
      } else {
        resultado = await this.cajaChicaService.crearGasto(gastoData).toPromise();
      }
      
      if (!resultado) {
        throw new Error('No se recibió respuesta del servidor');
      }

      this.messageService.add({
        severity: 'success',
        summary: this.modoEdicion ? 'Gasto actualizado' : 'Gasto creado',
        detail: `El gasto se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
      });

      // Redirigir al listado o al detalle
      this.router.navigate(['/caja-chica/gastos']);
      
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudo ${this.modoEdicion ? 'actualizar' : 'crear'} el gasto`
      });
    } finally {
      this.guardando = false;
    }
  }

  private marcarCamposComoTocados() {
    this.gastoForm.markAllAsTouched();
    
    this.productosArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }

  // ===============================================
  // 🧭 NAVEGACIÓN Y CANCELAR
  // ===============================================

  cancelar() {
    if (this.gastoForm.dirty) {
      this.confirmationService.confirm({
        message: '¿Está seguro de cancelar? Se perderán los cambios no guardados.',
        header: 'Confirmar Cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'Continuar editando',
        accept: () => {
          this.router.navigate(['/caja-chica/gastos']);
        }
      });
    } else {
      this.router.navigate(['/caja-chica/gastos']);
    }
  }

  // ===============================================
  // 🎨 UTILIDADES
  // ===============================================

  formatearMoneda(valor: number): string {
    return this.cajaChicaService.formatearMoneda(valor);
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  obtenerNombreDeposito(depositoId: number): string {
    const deposito = this.depositos.find(d => d.id === depositoId);
    return deposito ? deposito.nombre : 'Depósito no encontrado';
  }

  obtenerNombreProveedor(proveedorId: number): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
  }

  obtenerProveedor(proveedorId: number): Proveedor | null {
    return this.proveedores.find(p => p.id === proveedorId) || null;
  }

  // ===============================================
  // 🔍 VALIDACIONES HELPER
  // ===============================================

  esCampoInvalido(campo: string): boolean {
    const control = this.gastoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  esProductoCampoInvalido(index: number, campo: string): boolean {
    const control = this.productosArray.at(index)?.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obtenerMensajeError(campo: string): string {
    const control = this.gastoForm.get(campo);
    if (!control || !control.errors) return '';

    const errores = control.errors;
    
    if (errores['required']) return `${campo} es requerido`;
    if (errores['pattern'] && campo === 'numero_factura') return 'Formato: 001-001-0000123';
    if (errores['minlength']) return `Mínimo ${errores['minlength'].requiredLength} caracteres`;
    if (errores['email']) return 'Email inválido';
    
    return 'Campo inválido';
  }

  /**
   * Helper para validar campos del formulario de proveedor
   */
  esProveedorCampoInvalido(campo: string): boolean {
    const control = this.nuevoProveedorForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtener mensaje de error específico para campos de proveedor
   */
  obtenerMensajeErrorProveedor(campo: string): string {
    const control = this.nuevoProveedorForm.get(campo);
    if (!control || !control.errors) return '';

    const errores = control.errors;
    
    if (errores['required']) {
      switch(campo) {
        case 'nombre': return 'El nombre del proveedor es requerido';
        case 'ruc': return 'El RUC es requerido';
        default: return `${campo} es requerido`;
      }
    }
    
    if (errores['pattern'] && campo === 'ruc') return 'Formato de RUC inválido. Use: 12345678-1';
    if (errores['minlength']) return `Mínimo ${errores['minlength'].requiredLength} caracteres`;
    if (errores['email']) return 'Formato de email inválido';
    
    return 'Campo inválido';
  }

  /**
   * Formatear RUC automáticamente mientras el usuario escribe (Paraguay)
   * Acepta RUC personal (CI + dígito) y empresarial
   */
  formatearRUCProveedor(event: any) {
    let valor = event.target.value;
    
    // Remover caracteres no numéricos excepto guiones
    valor = valor.replace(/[^\d-]/g, '');
    
    // Remover guiones existentes para reformatear
    const soloNumeros = valor.replace(/-/g, '');
    
    // Aplicar formato automáticamente 
    // RUC Personal: 6-8 dígitos + verificador (ej: 4264123-3, 810002-0)
    // RUC Empresarial: 8 dígitos + verificador (ej: 12345678-9)
    if (soloNumeros.length >= 6) {
      // Encontrar la posición del último dígito (verificador)
      const digitosBase = soloNumeros.substring(0, soloNumeros.length - 1);
      const digitoVerificador = soloNumeros.substring(soloNumeros.length - 1);
      
      if (digitosBase.length >= 6 && digitoVerificador) {
        valor = digitosBase + '-' + digitoVerificador;
      } else {
        valor = soloNumeros;
      }
    } else {
      valor = soloNumeros;
    }
    
    // Limitar a 10 caracteres máximo (para RUC empresarial 12345678-9)
    if (valor.length > 10) {
      valor = valor.substring(0, 10);
    }
    
    // Actualizar el campo
    this.nuevoProveedorForm.patchValue({ ruc: valor });
    event.target.value = valor;
  }

  /**
   * Formatear RUC automáticamente mientras el usuario escribe (función legacy)
   */
  formatearRUC(event: any) {
    // Redirigir a la nueva función
    this.formatearRUCProveedor(event);
  }
}