// src/app/components/home/add-post/add-post.component.ts

import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile/profile.service';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent {
  /** Ahora emitimos void; el padre recarga el feed desde el servicio */
  @Output() postCreated = new EventEmitter<void>();



  showForm = false;
  postContent = '';
  selectedFile: File | null = null;

  user: any;
  profileFields: { label: string, value: string }[] = [];

  private profileService = inject(ProfileService);

  ngOnInit(): void {

    this.profileService.getProfile()
      .subscribe(profile => {
        if (!profile) return;

        this.user = profile;
        this.profileFields = [
          { label: 'Nombre completo', value: this.user.fullName },
          { label: 'Correo electrónico', value: this.user.email },
          { label: 'Teléfono', value: this.user.phone },
          { label: 'Tipo de usuario', value: this.user.role },
        ]});

  }

  openForm() {
    this.showForm = true;
  }

  cancel() {
    this.showForm = false;
    this.postContent = '';
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length
      ? input.files[0]
      : null;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  submitPost() {
    const text = this.postContent.trim();
    if (!text && !this.selectedFile) return;
    const formData = new FormData();
    formData.append('content', text);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Llamamos siempre a createPostWithImage, independientemente de si hay archivo.
    this.profileService.createPostWithImage(formData).subscribe({
      next: () => {
        // Emitimos sin payload; el padre escuchará y recargará el listado.
        this.postCreated.emit();
        this.cancel();
      },
      error: err => console.error('Error creando post', err)
    });
  }
}
