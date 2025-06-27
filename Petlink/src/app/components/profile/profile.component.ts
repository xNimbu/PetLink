// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';

import { AddEditPetModalComponent } from './add-edit-pet/add-edit-pet.component';
import { EditComponent } from './edit/edit.component';
import { ProfileService, Profile, Pet } from '../../services/profile/profile.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user!: Profile;
  pets: Pet[] = [];

  constructor(
    private modalService: NgbModal,
    private profileService: ProfileService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    this.loadProfile();
  }

  private loadProfile() {
    this.profileService.getProfile()
      .pipe(catchError(err => {
        console.error('Error al cargar perfil:', err);
        return of<Profile | null>(null);
      }))
      .subscribe(profile => {
        if (!profile) return;
        this.user = profile;
        this.pets = profile.pets || [];
      });
  }

  /** 1) Abrir modal de editar perfil */
  openEditProfileModal(): void {
    const modalRef = this.modalService.open(EditComponent, { size: 'lg' });
    modalRef.componentInstance.userData = { ...this.user };

    modalRef.result
      .then((updatedProfile: any) => {
        if (updatedProfile) {
          // Sustituimos localmente los datos
          this.user = updatedProfile;
          // o para recargar todo:
          // this.loadProfile();
        }
      })
      .catch(() => {
        // dismissed sin cambios
      });
  }

  /** 2) Abrir modal para agregar mascota */
  openAddPetModal(): void {
    const modalRef = this.modalService.open(AddEditPetModalComponent);
    modalRef.componentInstance.mode = 'add';

    modalRef.result
      .then((formData: FormData) => {
        return this.profileService.addPet(formData).toPromise();
      })
      .then(() => this.loadProfile())
      .catch(() => { /* dismiss o error silencioso */ });
  }

  /** 3) Abrir modal para editar mascota */
  openEditPetModal(pet: Pet): void {
    const modalRef = this.modalService.open(AddEditPetModalComponent);
    modalRef.componentInstance.mode = 'edit';
    modalRef.componentInstance.pet = pet;

    modalRef.result
      .then((formData: FormData) => {
        return this.profileService.updatePet(pet.id, formData).toPromise();
      })
      .then(() => this.loadProfile())
      .catch(() => { /* dismiss o error silencioso */ });
  }

  /** Eliminar mascota */
  deletePet(id: string): void {
    if (!confirm('¿Eliminar esta mascota?')) return;
    this.profileService.deletePet(id)
      .subscribe(() => this.loadProfile());
  }

  /** Cerrar sesión */
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
