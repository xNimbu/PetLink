// src/app/components/home/add-post/add-post.component.ts

import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile/profile.service';
import { Pet } from '../../../models';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent {
  @Output() postCreated = new EventEmitter<void>();

  showForm = false;
  postContent = '';
  selectedFile: File | null = null;

  // ← aquí declare tus propiedades de mascotas
  pets: Pet[] = [];
  selectedPet: Pet | null = null;

  user: any;
  profileFields: { label: string, value: string }[] = [];

  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.profileService.getProfile()
      .subscribe(profile => {
        if (!profile) return;
        this.user = profile;
        // ...
      });

    // carga la lista de mascotas
    this.profileService.listPets()
      .subscribe(resp => this.pets = resp.pets);
  }

  openForm() {
    this.showForm = true;
  }

  cancel() {
    this.showForm = false;
    this.postContent = '';
    this.selectedFile = null;
    this.selectedPet = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
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
    if (this.selectedPet) {
      formData.append('pet_id', this.selectedPet.id);
    }
    

    this.profileService.createPostWithImage(formData).subscribe({
      next: () => {
        this.postCreated.emit();
        this.cancel();
      },
      error: err => console.error('Error creando post', err)
    });
  }

}
