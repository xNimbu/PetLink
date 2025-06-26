import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-edit-pet-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <div class="modal-header">
        <h4 class="modal-title">{{ mode === 'add' ? 'Agregar Mascota' : 'Editar Mascota' }}</h4>
      </div>

      <div class="modal-body">

        <!-- Foto con pre-visualización -->
        <div class="text-center mb-3">
          <img [src]="previewUrl || form.value.photoURL || 'assets/images/default-pet.png'"
               class="rounded mb-2"
               style="width:120px;height:120px;object-fit:cover;">
          <div>
            <input type="file" accept="image/*" #file hidden (change)="onFileSelected($event)">
            <button type="button" class="btn btn-outline-primary btn-sm"
                    (click)="file.click()">Cambiar foto</button>
          </div>
        </div>

        <!-- Resto de campos -->
        <div class="form-group mb-2">
          <label>Nombre Mascota</label>
          <input class="form-control" formControlName="name" />
        </div>
        <div class="form-group mb-2">
          <label>Raza</label>
          <input class="form-control" formControlName="breed" />
        </div>
        <div class="form-group mb-2">
          <label>Edad</label>
          <input type="number" class="form-control" formControlName="age" />
        </div>
        <div class="form-group mb-2">
          <label>Tipo</label>
          <input class="form-control" formControlName="type" />
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || uploading">
          {{ uploading ? 'Subiendo…' : (mode === 'add' ? 'Agregar' : 'Guardar') }}
        </button>
      </div>
    </form>
  `
})
export class AddEditPetModalComponent {
  @Input() pet: any = null;
  @Input() mode: 'add' | 'edit' = 'add';

  form: FormGroup;

  previewUrl: string | null = null;
  selectedFile!: File;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      breed: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      photoURL: ['']
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.pet) {
      this.form.patchValue(this.pet);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => (this.previewUrl = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  /* Guardar */
  save(): void {
    if (this.selectedFile) {
      this.uploading = true;

      this.uploadPetPhoto(this.selectedFile).then(url => {
        this.form.patchValue({ photoURL: url });
        this.finalizeSave();
      });
    } else {
      this.finalizeSave();
    }
  }

  private finalizeSave(): void {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
    this.uploading = false;
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private uploadPetPhoto(file: File): Promise<string> {

    /* Simulación */
    return new Promise(resolve => {
      setTimeout(() => {
        this.uploading = false;
        resolve(this.previewUrl || this.form.value.photoURL);
      }, 1000);
    });
  }
}
