import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  ParteTrabajo, 
  ParteTrabajoCreate,
  ParteTrabajoUpdate,
  EstadoParteTrabajo,
  Tecnico 
} from '../../../models/partes-trabajo.model';
import { PartesTrabajoService } from '../../../services/partes-trabajo.service';

@Component({
  selector: 'app-parte-trabajo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parte-trabajo-form.component.html',
  styleUrls: ['./parte-trabajo-form.component.scss']
})
export class ParteTrabajoFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  parteId: number | null = null;
  loading = false;
  error: string | null = null;
  tecnicos: Tecnico[] = [];
  estadosDisponibles: EstadoParteTrabajo[] = [];

  constructor(
    private fb: FormBuilder,
    private partesTrabajoService: PartesTrabajoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.estadosDisponibles = this.partesTrabajoService.getEstadosDisponibles();
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.parteId = +params['id'];
        this.loadParteTrabajo();
      }
    });

    this.loadTecnicos();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id_api_externa: [''],
      tecnico_id: ['', Validators.required],
      cliente: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: [''],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado: [EstadoParteTrabajo.PENDIENTE, Validators.required],
      horas_normales: [0, [Validators.min(0)]],
      horas_extras_normales: [0, [Validators.min(0)]],
      horas_extras_especiales: [0, [Validators.min(0)]],
      observaciones: ['']
    });
  }

  loadParteTrabajo(): void {
    if (!this.parteId) return;

    this.loading = true;
    this.partesTrabajoService.getParteTrabajo(this.parteId).subscribe({
      next: (parte) => {
        this.form.patchValue({
          id_api_externa: parte.id_api_externa || '',
          tecnico_id: parte.tecnico_id,
          cliente: parte.cliente,
          fecha_inicio: this.formatDateForInput(parte.fecha_inicio),
          fecha_fin: parte.fecha_fin ? this.formatDateForInput(parte.fecha_fin) : '',
          descripcion: parte.descripcion,
          estado: parte.estado,
          horas_normales: parte.horas_normales || 0,
          horas_extras_normales: parte.horas_extras_normales || 0,
          horas_extras_especiales: parte.horas_extras_especiales || 0,
          observaciones: parte.observaciones || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la orden de trabajo';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  loadTecnicos(): void {
    this.partesTrabajoService.getTecnicos().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos.map(t => ({
          ...t,
          nombre_completo: `${t.nombre} ${t.apellido}`
        }));
      },
      error: (error) => {
        console.error('Error al cargar técnicos:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.form.value;

    if (this.isEditMode && this.parteId) {
      const updateData: ParteTrabajoUpdate = {
        ...formData,
        fecha_inicio: this.formatDateForApi(formData.fecha_inicio),
        fecha_fin: formData.fecha_fin ? this.formatDateForApi(formData.fecha_fin) : undefined
      };

      this.partesTrabajoService.updateParteTrabajo(this.parteId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error) => {
          this.error = 'Error al actualizar la orden de trabajo';
          console.error('Error:', error);
          this.loading = false;
        }
      });
    } else {
      const createData: ParteTrabajoCreate = {
        ...formData,
        fecha_inicio: this.formatDateForApi(formData.fecha_inicio),
        fecha_fin: formData.fecha_fin ? this.formatDateForApi(formData.fecha_fin) : undefined
      };

      this.partesTrabajoService.createParteTrabajo(createData).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error) => {
          this.error = 'Error al crear la orden de trabajo';
          console.error('Error:', error);
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/partes-trabajo']);
  }

  // Validaciones y utilidades
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tecnico_id: 'Técnico',
      cliente: 'Cliente',
      fecha_inicio: 'Fecha de inicio',
      descripcion: 'Descripción',
      estado: 'Estado',
      horas_normales: 'Horas normales',
      horas_extras_normales: 'Horas extras normales',
      horas_extras_especiales: 'Horas extras especiales'
    };
    return labels[fieldName] || fieldName;
  }

  formatearEstado(estado: EstadoParteTrabajo): string {
    return this.partesTrabajoService.formatearEstado(estado);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private formatDateForApi(dateString: string): string {
    return new Date(dateString).toISOString();
  }

  // Calcular total de horas
  get totalHoras(): number {
    const normales = this.form.get('horas_normales')?.value || 0;
    const extrasNormales = this.form.get('horas_extras_normales')?.value || 0;
    const extrasEspeciales = this.form.get('horas_extras_especiales')?.value || 0;
    return normales + extrasNormales + extrasEspeciales;
  }
}
