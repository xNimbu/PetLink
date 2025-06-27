// src/app/components/home/add-post/add-post.component.ts

import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
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

  private profileService = inject(ProfileService);

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
