// src/app/components/home/add-post/add-post.component.ts
import { Component, Output, EventEmitter, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile/profile.service';
import { PetsService } from '../../../services/pets/pets.service';
import { PostsService } from '../../../services/posts/posts.service';
import { Pet, Profile } from '../../../models';
import { AuthService } from '../../../services/auth/auth.service';
import { catchError, filter, first, switchMap, of } from 'rxjs';
import { LoadingService } from '../../../services/loading/loading.service';

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

  user!: Profile;
  profileFields: { label: string, value: string }[] = [];

  private profileService = inject(ProfileService);
  private petsService = inject(PetsService);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadingService.show();

    this.petsService.listPets()
      .pipe(
        catchError(err => {
          console.error('Error cargando mascotas', err);
          return of<Pet[]>([]);
        })
      )
      .subscribe(pets => {
        if (Array.isArray(pets)) {
          this.pets = pets;
        } else if (pets && Array.isArray((pets as any).pets)) {
          this.pets = (pets as any).pets;
        } else {
          this.pets = [];
        }
        this.loadingService.hide();
      });


    this.loadingService.show();
    this.authService.ready$
      .pipe(
        filter(ready => ready),
        first(),
        switchMap(() => this.profileService.getProfile()),
        catchError(err => {
          console.error('Error cargando perfil', err);
          this.loadingService.hide();
          return of<Profile | null>(null);
        })
      )
      .subscribe(profile => {
        if (!profile) {
          return;
        }
        this.user = profile;
        this.profileFields = [
          { label: 'Nombre completo', value: profile.fullName },
          { label: 'Correo electrónico', value: profile.email },
          { label: 'Teléfono', value: profile.phone ? profile.phone : 'No disponible' },
          { label: 'Tipo de usuario', value: profile.role }
        ];
        this.loadingService.hide();
      });
  }

  openForm(): void {
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.postContent = '';
    this.selectedFile = null;
    this.selectedPet = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  submitPost(): void {
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

    this.loadingService.show();
    this.postsService.createPostWithImage(formData).subscribe({
          next: () => {
      this.postCreated.emit();
      this.cancel();
    },
      error: err => {
        console.error('Error creando post', err);
        this.loadingService.hide();
      },
      complete: () => this.loadingService.hide()
    });
  }
}
