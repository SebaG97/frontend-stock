import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval, switchMap, startWith } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

import { AlarmasService } from '../../services/alarmas.service';
import { Vessel, ResumenAlarmas, FiltroAlarmas } from '../../models/alarmas.model';

@Component({
  selector: 'app-alarmas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    ProgressBarModule,
    ChipModule,
    PanelModule,
    SkeletonModule,
    MessageModule
  ],
  templateUrl: './alarmas.component.html',
  styleUrl: './alarmas.component.scss'
})
export class AlarmasComponent implements OnInit, OnDestroy {
  // Datos principales
  vessels: Vessel[] = [];
  resumen: ResumenAlarmas | null = null;
  vesselsFiltrados: Vessel[] = [];
  
  // Estados de carga
  loading = true;
  error: string | null = null;
  ultimaActualizacion = new Date();
  
  // Filtros y configuración
  filtros: FiltroAlarmas = {
    orden: 'desc',
    campo_orden: 'hours_since_last'
  };
  
  // Opciones de filtros
  estadosOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Operativo', value: 'normal' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Atención', value: 'attention' },
    { label: 'Crítico', value: 'critical' }
  ];
  
  tiempoOptions = [
    { label: 'Últimas 6 horas', value: 6 },
    { label: 'Últimas 12 horas', value: 12 },
    { label: 'Últimas 24 horas', value: 24 },
    { label: 'Últimas 48 horas', value: 48 }
  ];

  // Configuración de polling
  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 30000; // 30 segundos
  autoRefresh = true;

  // Configuración de vista
  vistaModo: 'grid' | 'tabla' = 'grid';
  vesselsPorFila = 6;
  
  constructor(
    private alarmasService: AlarmasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
    this.configurarPolling();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  inicializarDatos(): void {
    this.loading = true;
    this.error = null;
    
    console.log('🔄 Iniciando carga de datos de alarmas...');
    
    // Cargar resumen y vessels simultáneamente
    Promise.all([
      this.alarmasService.getResumenAlarmas().toPromise(),
      this.alarmasService.getAlarmas(this.filtros).toPromise()
    ]).then(([resumen, vessels]) => {
      console.log('✅ Datos recibidos:', { resumen, vesselsCount: vessels?.length || 0 });
      
      this.resumen = resumen || null;
      // Convertir vessels del backend al formato del frontend
      this.vessels = (vessels || []).map(v => this.convertirVessel(v));
      this.aplicarFiltros();
      this.ultimaActualizacion = new Date();
      this.loading = false;
      
      console.log('📊 Estado final:', {
        resumen: this.resumen,
        vesselsTotal: this.vessels.length,
        vesselsFiltrados: this.vesselsFiltrados.length
      });
      
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('❌ Error al cargar datos de alarmas:', error);
      console.error('📍 URL del API:', `${this.alarmasService['apiUrl'] || 'URL no definida'}`);
      
      this.error = `Error al cargar los datos de monitoring: ${error.message || error}`;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  configurarPolling(): void {
    if (this.autoRefresh) {
      this.pollingSubscription = interval(this.POLLING_INTERVAL)
        .pipe(
          startWith(0),
          switchMap(() => Promise.all([
            this.alarmasService.getResumenAlarmas().toPromise(),
            this.alarmasService.getAlarmas(this.filtros).toPromise()
          ]))
        )
        .subscribe({
          next: ([resumen, vessels]) => {
            this.resumen = resumen || null;
            this.vessels = vessels || [];
            this.aplicarFiltros();
            this.ultimaActualizacion = new Date();
            this.error = null;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error en polling:', error);
            this.error = 'Error de conexión';
            this.cdr.detectChanges();
          }
        });
    }
  }

  detenerPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.configurarPolling();
    } else {
      this.detenerPolling();
    }
  }

  aplicarFiltros(): void {
    let vesselsTemp = [...this.vessels];

    // Filtrar por estado si está seleccionado
    if (this.filtros.estado) {
      vesselsTemp = vesselsTemp.filter(v => this.getEstadoFrontend(v) === this.filtros.estado);
    }

    // Filtrar por nombre si hay búsqueda
    if (this.filtros.vessel_name?.trim()) {
      const busqueda = this.filtros.vessel_name.toLowerCase().trim();
      vesselsTemp = vesselsTemp.filter(v => 
        v.vessel_name.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar
    if (this.filtros.campo_orden && this.filtros.orden) {
      vesselsTemp.sort((a, b) => {
        const campo = this.filtros.campo_orden!;
        let valorA: any = a[campo as keyof Vessel];
        let valorB: any = b[campo as keyof Vessel];

        // Manejar valores nulos
        if (valorA == null) valorA = this.filtros.orden === 'asc' ? -Infinity : Infinity;
        if (valorB == null) valorB = this.filtros.orden === 'asc' ? -Infinity : Infinity;

        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase();
          valorB = valorB.toLowerCase();
        }

        const resultado = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
        return this.filtros.orden === 'desc' ? -resultado : resultado;
      });
    }

    this.vesselsFiltrados = vesselsTemp;
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  actualizarManual(): void {
    this.inicializarDatos();
  }

  cambiarVista(modo: 'grid' | 'tabla'): void {
    this.vistaModo = modo;
  }

  verDetalleVessel(vessel: Vessel): void {
    // TODO: Implementar modal con detalle del vessel
    console.log('Ver detalle de vessel:', vessel.vessel_name);
  }

  getEstadoSeverity(vessel: Vessel): string {
    const status = this.getEstadoFrontend(vessel);
    const severities: Record<string, string> = {
      'normal': 'success',
      'warning': 'warning',
      'attention': 'warning',
      'critical': 'danger'
    };
    return severities[status] || 'info';
  }

  getEstadoIcono(vessel: Vessel): string {
    const status = this.getEstadoFrontend(vessel);
    const iconos: Record<string, string> = {
      'normal': 'pi pi-check-circle',
      'warning': 'pi pi-exclamation-triangle',
      'attention': 'pi pi-exclamation-circle',
      'critical': 'pi pi-times-circle'
    };
    return iconos[status] || 'pi pi-question-circle';
  }

  formatearTiempo(horas?: number): string {
    if (horas == null || horas < 0) return 'Tiempo real';
    return this.alarmasService.formatearTiempoTranscurrido(horas);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getColorEstado(vessel: Vessel): string {
    return this.alarmasService.getColorPorHoras(vessel.horas_sin_datos);
  }

  getTextoEstado(vessel: Vessel): string {
    const status = this.getEstadoFrontend(vessel);
    return this.alarmasService.getTextoEstado(status);
  }

  // Conversión de vessels del backend al formato del frontend
  private convertirVessel(vesselBackend: any): Vessel {
    return {
      vessel_name: vesselBackend.vessel_name,
      ultimo_dato: vesselBackend.ultimo_dato,
      horas_sin_datos: vesselBackend.horas_sin_datos,
      estado_alarma: vesselBackend.estado_alarma,
      mensaje: vesselBackend.mensaje,
      // Propiedades del frontend para compatibilidad
      last_measurement: vesselBackend.ultimo_dato,
      hours_since_last: vesselBackend.horas_sin_datos,
      status: this.alarmasService.convertirEstadoAFrontend(vesselBackend.estado_alarma),
      status_color: this.alarmasService.getColorPorHoras(vesselBackend.horas_sin_datos)
    } as any;
  }

  // Getters para templates
  get vesselsCriticos(): number {
    return this.vesselsFiltrados.filter(v => this.getEstadoFrontend(v) === 'critical').length;
  }

  get vesselsAdvertencia(): number {
    return this.vesselsFiltrados.filter(v => this.getEstadoFrontend(v) === 'warning').length;
  }

  get vesselsAtencion(): number {
    return this.vesselsFiltrados.filter(v => this.getEstadoFrontend(v) === 'attention').length;
  }

  get vesselsOperativos(): number {
    return this.vesselsFiltrados.filter(v => this.getEstadoFrontend(v) === 'normal').length;
  }

  getEstadoFrontend(vessel: Vessel): string {
    return this.alarmasService.convertirEstadoAFrontend(vessel.estado_alarma);
  }

  get porcentajeOperativo(): number {
    if (!this.vesselsFiltrados.length) return 0;
    return Math.round((this.vesselsOperativos / this.vesselsFiltrados.length) * 100);
  }

  // TrackBy function para optimizar rendering
  trackByVessel(index: number, vessel: Vessel): string {
    return vessel.vessel_name;
  }
}