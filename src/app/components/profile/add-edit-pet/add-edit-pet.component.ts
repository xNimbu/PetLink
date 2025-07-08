import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-edit-pet-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-pet.component.html',
  styleUrls: ['./add-edit-pet.component.scss'],
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
      this.previewUrl = this.pet.photoURL || null;
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
    if (!this.form.valid) {
      this.uploading = false;
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('breed', this.form.value.breed);
    formData.append('age', this.form.value.age);
    formData.append('type', this.form.value.type);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else if (this.form.value.photoURL) {
      formData.append('photoURL', this.form.value.photoURL);
    }

    this.activeModal.close(formData);
    this.uploading = false;
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private uploadPetPhoto(file: File): Promise<string> {

    // Antes simulábamos espera con un setTimeout que demoraba 1s
    // Ahora resolvemos inmediatamente para agilizar la carga
    this.uploading = false;
    return Promise.resolve(this.previewUrl || this.form.value.photoURL);
  }
}
