// src/app/components/profile/edit/edit.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from '../../../services/profile/profile.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnInit {
  @Input() userData!: any;

  form: FormGroup;
  previewUrl: string | null = null;
  selectedFile?: File;
  uploading = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      username: [''],
      photoURL: ['']
    });
  }

  ngOnInit(): void {
    if (this.userData) {
      this.form.patchValue({
        fullName: this.userData.fullName,
        email: this.userData.email,
        phone: this.userData.phone,
        username: this.userData.username,
      });
      this.previewUrl = this.userData.photoURL;
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) return;
    this.uploading = true;

    // Siempre uso FormData + POST
    const formData = new FormData();
    formData.append('fullName', this.form.value.fullName);
    formData.append('email', this.form.value.email);
    formData.append('phone', this.form.value.phone);
    formData.append('username', this.form.value.username);

    // Si no cambiaste la foto, envía la URL actual
    if (!this.selectedFile) {
      formData.append('photoURL', this.previewUrl || this.userData.photoURL);
    } else {
      // Si cambiaste, envía el archivo
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.profileService.updateProfileForm(formData)
      .subscribe({
        next: () => {
          this.uploading = false;
          // Devuelvo al padre el perfil actualizado
          this.activeModal.close({
            fullName: this.form.value.fullName,
            email: this.form.value.email,
            phone: this.form.value.phone,
            username: this.form.value.username,
            photoURL: this.previewUrl
          });
        },
        error: err => {
          console.error('Error al actualizar perfil', err);
          this.uploading = false;
        }
      });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}
