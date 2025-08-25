import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  ParteTrabajo, 
  ParteTrabajoCreate,
  ParteTrabajoUpdate,
  EstadoParteTrabajo,
  TecnicoSimple 
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
  tecnicos: TecnicoSimple[] = [];
  estadosDisponibles = [
    { label: 'Pendiente', value: 1 },
    { label: 'En Proceso', value: 2 },
    { label: 'Completado', value: 3 },
    { label: 'Cancelado', value: 4 }
  ];

  constructor(
    private fb: FormBuilder,
    private partesTrabajoService: PartesTrabajoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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
      id_parte_api: [''],
      numero: [0, [Validators.required, Validators.min(1)]],
      ejercicio: [new Date().getFullYear().toString(), Validators.required],
      fecha: ['', Validators.required],
      hora_ini: [''],
      hora_fin: [''],
      trabajo_solicitado: ['', [Validators.required, Validators.minLength(10)]],
      estado: [1, Validators.required],
      cliente_empresa: [''],
      notas: [''],
      archivado: [false],
      firmado: [false]
    });
  }

  loadParteTrabajo(): void {
    if (!this.parteId) return;

    this.loading = true;
    this.partesTrabajoService.getParteTrabajoById(this.parteId).subscribe({
      next: (parte: ParteTrabajo) => {
        this.form.patchValue({
          id_parte_api: parte.id_parte_api || '',
          numero: parte.numero,
          ejercicio: parte.ejercicio,
          fecha: this.formatDateForInput(parte.fecha),
          hora_ini: parte.hora_ini || '',
          hora_fin: parte.hora_fin || '',
          trabajo_solicitado: parte.trabajo_solicitado,
          estado: parte.estado,
          cliente_empresa: parte.cliente_empresa || '',
          notas: parte.notas || '',
          archivado: parte.archivado,
          firmado: parte.firmado
        });
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar la orden de trabajo';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  loadTecnicos(): void {
    this.partesTrabajoService.getTecnicos().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
      },
      error: (error: any) => {
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
        fecha: this.formatDateForApi(formData.fecha)
      };

      this.partesTrabajoService.updateParteTrabajo(this.parteId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error: any) => {
          this.error = 'Error al actualizar la orden de trabajo';
          console.error('Error:', error);
          this.loading = false;
        }
      });
    } else {
      const createData: ParteTrabajoCreate = {
        ...formData,
        fecha: this.formatDateForApi(formData.fecha)
      };

      this.partesTrabajoService.createParteTrabajo(createData).subscribe({
        next: () => {
          this.router.navigate(['/partes-trabajo']);
        },
        error: (error: any) => {
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
      numero: 'Número',
      ejercicio: 'Ejercicio',
      fecha: 'Fecha',
      hora_ini: 'Hora inicio',
      hora_fin: 'Hora fin',
      trabajo_solicitado: 'Trabajo solicitado',
      estado: 'Estado',
      cliente_empresa: 'Cliente/Empresa',
      notas: 'Notas',
      id_parte_api: 'ID API Externa'
    };
    return labels[fieldName] || fieldName;
  }

  formatearEstado(estado: EstadoParteTrabajo): string {
    const estadosMap: { [key: number]: string } = {
      1: 'Pendiente',
      2: 'En Proceso', 
      3: 'Completado',
      4: 'Cancelado'
    };
    return estadosMap[estado] || 'Desconocido';
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
}
