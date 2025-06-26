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
      photoURL: ['']
    });
  }

  ngOnInit(): void {
    if (this.userData) {
      this.form.patchValue({
        fullName: this.userData.fullName,
        email: this.userData.email,
        phone: this.userData.phone,
      });
      this.previewUrl = this.userData.photoURL;
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

  save(): void {
    if (this.form.invalid) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('fullName', this.form.get('fullName')!.value);
    formData.append('email', this.form.get('email')!.value);
    formData.append('phone', this.form.get('phone')!.value);
    // anexamos el file si existe
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    }

    this.profileService.updateProfileForm(formData).subscribe({
      next: (updatedProfile) => {
        this.uploading = false;
        // Devuelvo al componente padre los datos actualizados
        this.activeModal.close(updatedProfile);
      },
      error: (err) => {
        console.error('Error guardando perfil', err);
        this.uploading = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}