import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';


import { CajaChicaService } from '../../services/caja-chica.service';
import { 
  ResumenCajaChica, 
  GastoResumen,
  FORMATO_MONEDA 
} from '../../models/caja-chica.model';

/**
 * 📊 Dashboard Principal de Caja Chica
 * 
 * Muestra:
 * - Saldo actual y estadísticas
 * - Últimos gastos
 * - Accesos rápidos a funciones principales
 */
@Component({
  selector: 'app-caja-chica-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule, 
    ProgressBarModule,
    TableModule,
    TagModule,
    TooltipModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    RadioButtonModule
  ],
  providers: [MessageService],
  templateUrl: './caja-chica-dashboard.component.html',
  styleUrls: ['./caja-chica-dashboard.component.scss']
})
export class CajaChicaDashboardComponent implements OnInit {
  // 📊 Datos del dashboard
  resumen: ResumenCajaChica | null = null;
  ultimosGastos: GastoResumen[] = [];
  loading = true;
  loadingGastos = true;

  // 📈 Métricas calculadas
  porcentajeGastado = 0;
  saldoRestante = 0;

  // 💰 Modal de configuración de saldo
  mostrarModalSaldo = false;
  tipoOperacionSaldo: 'incrementar' | 'decrementar' | 'establecer' | null = null;
  montoSaldo: number | null = null;
  motivoSaldo = '';

  constructor(
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDashboard();
    this.cargarUltimosGastos();
  }

  // ===============================================
  // 📊 CARGA DE DATOS
  // ===============================================

  cargarDashboard() {
    this.loading = true;
    
    this.cajaChicaService.obtenerResumen().subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.calcularMetricas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el resumen de caja chica'
        });
        this.loading = false;
      }
    });
  }

  cargarUltimosGastos() {
    this.loadingGastos = true;
    
    this.cajaChicaService.listarGastos({ limit: 5 }).subscribe({
      next: (response) => {
        this.ultimosGastos = response.gastos;
        this.loadingGastos = false;
      },
      error: (error) => {
        console.error('Error al cargar últimos gastos:', error);
        this.loadingGastos = false;
      }
    });
  }

  // ===============================================
  // 🧮 CÁLCULOS Y MÉTRICAS
  // ===============================================

  private calcularMetricas() {
    if (!this.resumen) return;

    const { caja_chica, gastos_totales } = this.resumen;
    
    // Calcular porcentaje gastado del monto inicial
    if (caja_chica.monto_inicial > 0) {
      this.porcentajeGastado = (gastos_totales / caja_chica.monto_inicial) * 100;
    }
    
    this.saldoRestante = caja_chica.saldo_actual;
  }

  // ===============================================
  // 🎨 FORMATEO Y UTILIDADES
  // ===============================================

  formatearMoneda(valor: number): string {
    return this.cajaChicaService.formatearMoneda(valor);
  }

  formatearFecha(fecha: string): string {
    return this.cajaChicaService.formatearFechaMostrar(fecha);
  }

  obtenerSeveridadSaldo(): string {
    if (!this.resumen) return 'info';
    
    const porcentaje = this.porcentajeGastado;
    
    if (porcentaje >= 90) return 'danger';
    if (porcentaje >= 70) return 'warning'; 
    return 'success';
  }

  obtenerColorProgressBar(): string {
    const severidad = this.obtenerSeveridadSaldo();
    
    switch (severidad) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  }

  // ===============================================
  // 🧭 NAVEGACIÓN
  // ===============================================

  irAGastos() {
    this.router.navigate(['/caja-chica/gastos']);
  }

  irANuevoGasto() {
    this.router.navigate(['/caja-chica/nuevo-gasto']);
  }

  irAProveedores() {
    this.router.navigate(['/proveedores']);
  }

  verDetalleGasto(gastoId: number) {
    this.router.navigate(['/caja-chica/gastos', gastoId]);
  }

  // ===============================================
  // 🔄 ACCIONES
  // ===============================================

  refrescarDatos() {
    this.cargarDashboard();
    this.cargarUltimosGastos();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos actualizados correctamente'
    });
  }

  // ===============================================
  // 💰 GESTIÓN DE SALDO
  // ===============================================

  abrirModalSaldo() {
    this.mostrarModalSaldo = true;
    this.tipoOperacionSaldo = null;
    this.montoSaldo = null;
    this.motivoSaldo = '';
  }

  cerrarModalSaldo() {
    this.mostrarModalSaldo = false;
    this.tipoOperacionSaldo = null;
    this.montoSaldo = null;
    this.motivoSaldo = '';
  }

  obtenerLabelMonto(): string {
    switch (this.tipoOperacionSaldo) {
      case 'incrementar':
        return 'Monto a Agregar';
      case 'decrementar':
        return 'Monto a Retirar';
      case 'establecer':
        return 'Nuevo Saldo Total';
      default:
        return 'Monto';
    }
  }

  obtenerLabelBotonGuardar(): string {
    switch (this.tipoOperacionSaldo) {
      case 'incrementar':
        return 'Agregar Dinero';
      case 'decrementar':
        return 'Retirar Dinero';
      case 'establecer':
        return 'Establecer Saldo';
      default:
        return 'Guardar';
    }
  }

  calcularNuevoSaldo(): number {
    if (!this.resumen || !this.montoSaldo || !this.tipoOperacionSaldo) {
      return 0;
    }

    const saldoActual = this.resumen.caja_chica.saldo_actual;
    
    switch (this.tipoOperacionSaldo) {
      case 'incrementar':
        return saldoActual + this.montoSaldo;
      case 'decrementar':
        return saldoActual - this.montoSaldo;
      case 'establecer':
        return this.montoSaldo;
      default:
        return saldoActual;
    }
  }

  obtenerColorNuevoSaldo(): string {
    const nuevoSaldo = this.calcularNuevoSaldo();
    
    if (nuevoSaldo < 0) {
      return 'text-red-600';
    } else if (nuevoSaldo > (this.resumen?.caja_chica.saldo_actual || 0)) {
      return 'text-green-600';
    } else {
      return 'text-blue-600';
    }
  }

  async guardarAjusteSaldo() {
    if (!this.tipoOperacionSaldo || !this.montoSaldo || !this.motivoSaldo) {
      return;
    }

    const nuevoSaldo = this.calcularNuevoSaldo();
    
    // Validar que el nuevo saldo no sea negativo
    if (nuevoSaldo < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El saldo no puede ser negativo'
      });
      return;
    }

    try {
      const ajuste = {
        tipo_operacion: this.tipoOperacionSaldo,
        monto: this.montoSaldo,
        motivo: this.motivoSaldo,
        fecha: new Date().toISOString().split('T')[0]
      };

      this.cajaChicaService.ajustarSaldo(ajuste).subscribe({
        next: (resumenActualizado) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Saldo Actualizado',
            detail: `Saldo ${this.tipoOperacionSaldo === 'incrementar' ? 'incrementado' : 
                      this.tipoOperacionSaldo === 'decrementar' ? 'decrementado' : 'establecido'} correctamente`
          });

          this.cerrarModalSaldo();
          this.cargarDashboard(); // Recargar datos
        },
        error: (error) => {
          console.error('Error al ajustar saldo:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el saldo. Verifique la conexión con el servidor.'
          });
        }
      });

    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado'
      });
    }
  }
}