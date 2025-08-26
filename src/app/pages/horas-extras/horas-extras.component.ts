import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { HorasExtrasService, ResumenHorasExtras, ReporteHorasExtras, Tecnico, DetalleHorasExtras, ParteConHorasExtras } from '../../services/horas-extras.service';
import { PartesTrabajoService } from '../../services/partes-trabajo.service';

@Component({
  selector: 'app-horas-extras',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule,
    DropdownModule, TagModule, ToastModule, DialogModule,
    ProgressSpinnerModule, TooltipModule
  ],
  templateUrl: './horas-extras.component.html',
  styleUrls: ['./horas-extras.component.scss'],
  providers: [MessageService]
})
export class HorasExtrasComponent implements OnInit {
  reporte: ReporteHorasExtras | null = null;
  tecnicos: Tecnico[] = [];
  loading = false;
  sincronizando = false;

  // Filtros - inicializados con valores por defecto
  fechaInicioString = '';
  fechaFinString = '';
  
  get fechaInicio(): Date | null {
    return this.fechaInicioString ? new Date(this.fechaInicioString) : null;
  }
  
  get fechaFin(): Date | null {
    return this.fechaFinString ? new Date(this.fechaFinString) : null;
  }
  
  tecnicoSeleccionado: Tecnico | null = null;

  // Modal de detalle
  mostrarDetalle = false;
  detalleSeleccionado: DetalleHorasExtras | null = null;
  loadingDetalle = false;

  // Modal de partes de trabajo
  mostrarPartes = false;
  partesSeleccionadas: ParteConHorasExtras[] = [];
  tecnicoPartesSeleccionado: string = '';
  loadingPartes = false;

  constructor(
    private horasExtrasService: HorasExtrasService,
    private messageService: MessageService,
    private partesTrabajoService: PartesTrabajoService,
    private router: Router
  ) {
    // Inicializar fechas por defecto (del 21 del mes pasado al 20 del mes actual)
    this.inicializarPeriodoActual();
  }

  private inicializarPeriodoActual() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Fecha inicio: día 21 del mes anterior
    const fechaInicio = new Date(añoActual, mesActual - 1, 21);
    
    // Fecha fin: día 20 del mes actual
    const fechaFin = new Date(añoActual, mesActual, 20);
    
    this.fechaInicioString = fechaInicio.toISOString().split('T')[0];
    this.fechaFinString = fechaFin.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarTecnicos();
    this.cargarReporte();
  }

  cargarTecnicos() {
    this.horasExtrasService.getTecnicos().subscribe({
      next: (tecnicos) => {
        // Procesar técnicos para añadir nombre_completo
        this.tecnicos = tecnicos.map(tecnico => ({
          ...tecnico,
          nombre_completo: `${tecnico.nombre || ''} ${tecnico.apellido || ''}`.trim()
        }));
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar lista de técnicos'
        });
      }
    });
  }

  cargarReporte() {
    this.loading = true;
    
    // Solo enviar fechas si están definidas y no son strings vacíos
    const fechaInicio = (this.fechaInicio && this.fechaInicioString.trim()) ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = (this.fechaFin && this.fechaFinString.trim()) ? this.formatDate(this.fechaFin) : undefined;
    const tecnicoId = this.tecnicoSeleccionado?.id;

    console.log('🏢 === CARGANDO TABLA PRINCIPAL (REPORTE) ===');
    console.log('🏢 Filtros de la tabla principal:', {
      fechaInicio,
      fechaFin,
      tecnicoId,
      tecnicoNombre: this.tecnicoSeleccionado?.nombre
    });

    this.horasExtrasService.getReporte(fechaInicio, fechaFin, tecnicoId).subscribe({
      next: (reporte) => {
        console.log('🏢 Resultado tabla principal - Total técnicos:', reporte.resumen.length);
        
        // Buscar específicamente a Luis para comparación
        const luisReporte = reporte.resumen.find(r => 
          r.tecnico_nombre.toLowerCase().includes('luis') && 
          r.tecnico_apellido.toLowerCase().includes('gonzález')
        );
        
        if (luisReporte) {
          console.log('🏢 LUIS en tabla principal:', {
            partes_trabajados: luisReporte.partes_trabajados,
            horas_extras_normales: luisReporte.total_horas_extras_normales,
            horas_extras_especiales: luisReporte.total_horas_extras_especiales,
            total_horas_trabajadas: luisReporte.total_horas_trabajadas
          });
        } else {
          console.log('🏢 LUIS NO ENCONTRADO en tabla principal');
        }
        
        this.reporte = reporte;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte cargado: ${reporte.resumen.length} técnicos encontrados`
        });
      },
      error: (error) => {
        console.error('🏢 Error cargando reporte tabla principal:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el reporte de horas extras'
        });
      }
    });
  }

  sincronizar() {
    this.sincronizando = true;
    this.horasExtrasService.sincronizarPartes().subscribe({
      next: (response) => {
        this.sincronizando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sincronización completada correctamente'
        });
        this.cargarReporte(); // Recargar datos después de sincronizar
      },
      error: (error) => {
        console.error('Error en sincronización:', error);
        this.sincronizando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error durante la sincronización'
        });
      }
    });
  }

  verDetalle(resumen: ResumenHorasExtras) {
    this.loadingDetalle = true;
    this.mostrarDetalle = true;
    this.detalleSeleccionado = null;
    
    const fechaInicio = this.fechaInicio ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = this.fechaFin ? this.formatDate(this.fechaFin) : undefined;

    this.horasExtrasService.getDetalleTecnico(resumen.tecnico_id, fechaInicio, fechaFin).subscribe({
      next: (detalle) => {
        this.detalleSeleccionado = detalle;
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('Error cargando detalle:', error);
        this.loadingDetalle = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el detalle del técnico'
        });
        this.mostrarDetalle = false;
      }
    });
  }

  verPartesTrabajo(resumen: ResumenHorasExtras) {
    this.loadingPartes = true;
    this.mostrarPartes = true;
    this.partesSeleccionadas = [];
    this.tecnicoPartesSeleccionado = `${resumen.tecnico_nombre} ${resumen.tecnico_apellido}`;
    
    const fechaInicio = this.fechaInicio ? this.formatDate(this.fechaInicio) : undefined;
    const fechaFin = this.fechaFin ? this.formatDate(this.fechaFin) : undefined;

    console.log('📋 === CARGANDO MODAL DE DETALLE ===');
    console.log('📋 Técnico seleccionado:', resumen.tecnico_nombre, resumen.tecnico_apellido);
    console.log('📋 Datos del resumen de la tabla principal:', {
      partes_trabajados: resumen.partes_trabajados,
      horas_extras_normales: resumen.total_horas_extras_normales,
      horas_extras_especiales: resumen.total_horas_extras_especiales,
      total_horas_trabajadas: resumen.total_horas_trabajadas
    });
    console.log('📋 EXPECTATIVA: Encontrar', resumen.partes_trabajados, 'partes en el modal');

    // TEMPORAL: Expandir rango para debugging si hay pocas partes
    let fechaInicioExpandida = fechaInicio;
    let fechaFinExpandida = fechaFin;
    
    // Si no hay fechas definidas, usar un rango muy amplio para debugging
    if (!fechaInicio && !fechaFin) {
      fechaInicioExpandida = '2025-06-01'; // Rango amplio para debugging
      fechaFinExpandida = '2025-08-31';
      console.log('🔧 DEBUGGING: Usando rango expandido:', fechaInicioExpandida, 'a', fechaFinExpandida);
    }
    
    console.log('📋 Período de filtro del modal:', fechaInicioExpandida, 'a', fechaFinExpandida);
    console.log('📋 ¿COINCIDEN LAS FECHAS? Tabla principal vs Modal');

    // Usar directamente el servicio de partes de trabajo para obtener TODAS las partes
    this.partesTrabajoService.getPartesTrabajo().subscribe({
      next: (response) => {
        const todasLasPartes = response.partes || response;
        console.log('Total partes en el sistema:', todasLasPartes.length);
        
        // Filtrar por técnico
        const partesDelTecnico = todasLasPartes.filter((parte: any) => {
          const participaTecnico = parte.tecnicos && parte.tecnicos.some((t: any) => {
            const coincideId = t.id === resumen.tecnico_id || t.user_id === resumen.tecnico_id;
            const coincideNombre = (t.nombre + ' ' + (t.apellido || '')).toLowerCase().includes(resumen.tecnico_nombre.toLowerCase());
            return coincideId || coincideNombre;
          });
          return participaTecnico;
        });

        console.log(`Partes del técnico ${resumen.tecnico_nombre}: ${partesDelTecnico.length}`);
        
        // APLICAR filtro de fecha para mostrar solo partes del período seleccionado
        let partesFiltradas = partesDelTecnico;
        if (fechaInicioExpandida || fechaFinExpandida) {
          partesFiltradas = partesDelTecnico.filter((parte: any) => {
            const fechaParte = parte.fecha || parte.hora_inicio;
            if (fechaParte) {
              const fecha = new Date(fechaParte).toISOString().split('T')[0];
              console.log(`Evaluando parte ${parte.numero}: fecha=${fecha}, rango=${fechaInicioExpandida} - ${fechaFinExpandida}`);
              
              if (fechaInicioExpandida && fecha < fechaInicioExpandida) {
                console.log(`  ❌ Excluida: ${fecha} < ${fechaInicioExpandida}`);
                return false;
              }
              if (fechaFinExpandida && fecha > fechaFinExpandida) {
                console.log(`  ❌ Excluida: ${fecha} > ${fechaFinExpandida}`);
                return false;
              }
              console.log(`  ✅ Incluida en el período`);
            }
            return true;
          });
          console.log(`Partes en el período ${fechaInicioExpandida} - ${fechaFinExpandida}: ${partesFiltradas.length}`);
        }
        
        if (partesFiltradas.length === 0) {
          this.partesSeleccionadas = [];
          this.loadingPartes = false;
          this.messageService.add({
            severity: 'info',
            summary: 'Sin datos',
            detail: `No se encontraron partes de trabajo para ${resumen.tecnico_nombre} ${resumen.tecnico_apellido} en el período seleccionado`,
            life: 4000
          });
          return;
        }
        
        // Convertir y calcular horas extras para cada parte
        this.partesSeleccionadas = partesFiltradas.map((parte: any) => {
          const horasNormales = this.calcularHorasNormales(parte.hora_inicio, parte.hora_fin);
          const horasExtrasNormales = this.calcularHorasExtrasNormales(parte.hora_inicio, parte.hora_fin);
          const horasExtrasEspeciales = this.calcularHorasExtrasEspeciales(parte.hora_inicio, parte.hora_fin);
          const horasTrabajadas = this.calcularHorasTrabajadas(parte.hora_inicio, parte.hora_fin);
          
          const tieneHorasExtras = horasExtrasNormales > 0 || horasExtrasEspeciales > 0;
          
          console.log(`Parte ${parte.numero}: ${horasTrabajadas}h total (${horasNormales}h normales + ${horasExtrasNormales}h extras + ${horasExtrasEspeciales}h especiales) - Tiene extras: ${tieneHorasExtras}`);
          
          return {
            id: parte.id,
            fecha: parte.fecha || parte.hora_inicio?.split('T')[0] || '2025-08-26',
            parte: parte.numero?.toString() || parte.id?.toString() || 'N/A',
            cliente: parte.cliente_empresa || 'Sin cliente',
            descripcion: parte.trabajo_solicitado || 'Sin descripción',
            horas_trabajadas: horasTrabajadas,
            horas_normales: horasNormales,
            horas_extras_normales: horasExtrasNormales,
            horas_extras_especiales: horasExtrasEspeciales,
            tiene_horas_extras: tieneHorasExtras, // Campo para destacar visualmente
            orden_trabajo_numero: parte.numero
          };
        });
        
        // Ordenar: primero las que tienen horas extras
        this.partesSeleccionadas.sort((a, b) => {
          if (a.tiene_horas_extras && !b.tiene_horas_extras) return -1;
          if (!a.tiene_horas_extras && b.tiene_horas_extras) return 1;
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
        
        const partesConHorasExtras = this.partesSeleccionadas.filter(p => p.tiene_horas_extras).length;
        const totalHorasExtrasNormales = this.partesSeleccionadas.reduce((sum, p) => sum + p.horas_extras_normales, 0);
        
        console.log(`📋 ✅ RESULTADO FINAL DEL MODAL:`);
        console.log(`📋    - Partes encontradas: ${this.partesSeleccionadas.length}`);
        console.log(`📋    - Con horas extras: ${partesConHorasExtras}`);
        console.log(`📋    - Total horas extras: ${totalHorasExtrasNormales}`);
        console.log(`📋 🔍 COMPARACIÓN CON TABLA PRINCIPAL:`);
        console.log(`📋    - Tabla principal dice: ${resumen.partes_trabajados} partes`);
        console.log(`📋    - Modal encontró: ${this.partesSeleccionadas.length} partes`);
        console.log(`📋    - ¿COINCIDEN? ${resumen.partes_trabajados === this.partesSeleccionadas.length ? '✅ SÍ' : '❌ NO'}`);
        
        if (resumen.partes_trabajados !== this.partesSeleccionadas.length) {
          console.log(`📋 ⚠️  DISCREPANCIA DETECTADA:`);
          console.log(`📋    - Diferencia: ${Math.abs(resumen.partes_trabajados - this.partesSeleccionadas.length)} partes`);
          console.log(`📋    - Posibles causas:`);
          console.log(`📋      1. Endpoint /reporte agrupa o filtra diferente que /partes-trabajo`);
          console.log(`📋      2. El endpoint /reporte podría estar contando solo partes con horas extras`);
          console.log(`📋      3. Lógica de negocio diferente en el backend`);
          console.log(`📋    - RECOMENDACIÓN: Verificar que ambos endpoints usen la misma lógica`);
          
          // Agregar análisis de las partes con datos anómalos
          const partesAnomalas = this.partesSeleccionadas.filter(p => p.horas_trabajadas > 24);
          if (partesAnomalas.length > 0) {
            console.log(`📋 🚨 DATOS ANÓMALOS DETECTADOS:`);
            console.log(`📋    - ${partesAnomalas.length} partes con más de 24 horas:`);
            partesAnomalas.forEach(p => {
              console.log(`📋      * Parte ${p.parte}: ${p.horas_trabajadas}h (REVISAR DATOS)`);
            });
            console.log(`📋    - Esto puede afectar los cálculos de horas extras`);
          }
        }
        
        this.loadingPartes = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Partes cargadas',
          detail: `${this.partesSeleccionadas.length} partes encontradas (${partesConHorasExtras} con horas extras)`,
          life: 4000
        });
      },
      error: (error) => {
        console.error('Error cargando partes:', error);
        this.loadingPartes = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las partes de trabajo'
        });
        this.mostrarPartes = false;
      }
    });
  }

  limpiarFiltros() {
    // Establecer un rango muy amplio para ver todos los datos
    // Desde hace 2 años hasta dentro de 1 año
    const hoy = new Date();
    const fechaInicioAmplia = new Date(hoy.getFullYear() - 2, 0, 1); // 1 enero hace 2 años
    const fechaFinAmplia = new Date(hoy.getFullYear() + 1, 11, 31); // 31 diciembre del próximo año
    
    this.fechaInicioString = fechaInicioAmplia.toISOString().split('T')[0];
    this.fechaFinString = fechaFinAmplia.toISOString().split('T')[0];
    this.tecnicoSeleccionado = null;
    this.cargarReporte();
  }

  verTodosLosDatos() {
    // Solo quitar filtros de fecha, mantener técnico seleccionado si hay
    this.fechaInicioString = '';
    this.fechaFinString = '';
    this.cargarReporte();
  }

  aplicarPeriodoActual() {
    // Solo cambiar fechas al período actual, mantener técnico seleccionado si hay
    this.inicializarPeriodoActual();
    this.cargarReporte();
  }

  limpiarTodo() {
    // Limpiar completamente todos los filtros
    this.fechaInicioString = '';
    this.fechaFinString = '';
    this.tecnicoSeleccionado = null;
    this.cargarReporte();
  }

  exportarDatos() {
    // TODO: Implementar exportación a Excel/CSV
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad de exportación en desarrollo'
    });
  }

  // Métodos auxiliares para las partes de trabajo
  getTotalHorasPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => total + parte.horas_trabajadas, 0);
  }

  getTotalHorasExtrasPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => 
      total + parte.horas_extras_normales + parte.horas_extras_especiales, 0);
  }

  getTotalHorasNormalesPartes(): number {
    return this.partesSeleccionadas.reduce((total, parte) => total + parte.horas_normales, 0);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTotalHorasExtrasNormales(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_extras_normales, 0) || 0;
  }

  getTotalHorasExtrasEspeciales(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_extras_especiales, 0) || 0;
  }

  getTotalHorasTrabajadas(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.total_horas_trabajadas, 0) || 0;
  }

  getTotalPartes(): number {
    return this.reporte?.resumen.reduce((sum, item) => sum + item.partes_trabajados, 0) || 0;
  }

  getSeverityForHorasExtras(horas: number): string {
    if (horas === 0) return 'secondary';
    if (horas <= 10) return 'info';
    if (horas <= 20) return 'warning';
    return 'danger';
  }

  getTecnicoNombreCompleto(tecnico: Tecnico | null | undefined): string {
    if (!tecnico) return '';
    return tecnico.nombre_completo || `${tecnico.nombre || ''} ${tecnico.apellido || ''}`.trim();
  }

  // Métodos de cálculo de horas
  private calcularHorasTrabajadas(horaInicio?: string, horaFin?: string): number {
    if (!horaInicio || !horaFin) return 0;
    
    const inicio = new Date(horaInicio);
    const fin = new Date(horaFin);
    
    if (fin <= inicio) return 0;
    
    const diferenciaMilisegundos = fin.getTime() - inicio.getTime();
    const horas = diferenciaMilisegundos / (1000 * 60 * 60);
    
    // 🚨 VALIDACIÓN: Detectar horas anómalas (más de 24h indica problema de datos)
    if (horas > 24) {
      console.warn(`⚠️  DATOS ANÓMALOS: ${horas}h entre ${horaInicio} y ${horaFin}`);
      console.warn(`⚠️  Esto sugiere error en datos de fecha/hora. Limitando a 24h máximo.`);
      return 24; // Limitar a un máximo razonable
    }
    
    return Math.round(horas * 100) / 100; // Redondear a 2 decimales
  }

  private calcularHorasNormales(horaInicio?: string, horaFin?: string): number {
    const horasTrabajadas = this.calcularHorasTrabajadas(horaInicio, horaFin);
    // Máximo 8 horas normales por día
    return Math.min(horasTrabajadas, 8);
  }

  private calcularHorasExtrasNormales(horaInicio?: string, horaFin?: string): number {
    const horasTrabajadas = this.calcularHorasTrabajadas(horaInicio, horaFin);
    // Horas extras normales: todo lo que exceda 8 horas hasta 12 horas
    const horasExtras = Math.max(horasTrabajadas - 8, 0);
    return Math.min(horasExtras, 4); // Máximo 4 horas extras normales (8+4=12)
  }

  private calcularHorasExtrasEspeciales(horaInicio?: string, horaFin?: string): number {
    const horasTrabajadas = this.calcularHorasTrabajadas(horaInicio, horaFin);
    // Horas extras especiales: todo lo que exceda 12 horas
    return Math.max(horasTrabajadas - 12, 0);
  }

  // Método para navegar a detalle de parte de trabajo
  verDetalleParte(parte: any) {
    if (parte.orden_trabajo_numero) {
      this.router.navigate(['/partes-trabajo', parte.orden_trabajo_numero]);
    } else if (parte.id) {
      this.router.navigate(['/partes-trabajo', parte.id]);
    }
  }

  getPartesConHorasExtras(): number {
    return this.partesSeleccionadas.filter(parte => parte.tiene_horas_extras).length;
  }
}
