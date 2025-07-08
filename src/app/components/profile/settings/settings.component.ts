// src/app/components/profile/profile.component.ts
import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, of } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';

import { AddEditPetModalComponent } from '../add-edit-pet/add-edit-pet.component';
import { EditComponent } from '../edit/edit.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { PetsService } from '../../../services/pets/pets.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Pet, Profile } from '../../../models';
import { LoadingService } from '../../../services/loading/loading.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user!: Profile;
  pets: Pet[] = [];
  errorMsg = '';
  loading = true;

  private profileService = inject(ProfileService);
  private petsService    = inject(PetsService);
  private authService    = inject(AuthService);
  private modalService   = inject(NgbModal);
  private platformId     = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);
  private subs = new Subscription();

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    this.loadingService.show();

    this.subs = this.authService.ready$
      .pipe(
        filter(ready => ready),
        first(),
        switchMap(() => this.profileService.getProfile()),
        catchError(err => {
          console.error('Error al cargar perfil:', err);
          this.errorMsg = 'No se pudo cargar tu perfil.';
          this.loading = false;
          this.loadingService.hide();
          return of<Profile | null>(null);
        })
      )
      .subscribe(profile => {
        this.loading = false;
        this.loadingService.hide();
        if (!profile) return;
        this.user = profile;
        this.pets = profile.pets ?? [];
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openEditProfileModal(): void {
    const modalRef = this.modalService.open(EditComponent, { size: 'lg' });
    modalRef.componentInstance.userData = { ...this.user };
    modalRef.result
      .then((updated: Profile) => {
        if (updated) this.user = updated;
      })
      .catch(() => {});
  }

// src/app/components/profile/settings.component.ts
// src/app/components/profile/settings.component.ts

openAddPetModal(): void {
  const modalRef = this.modalService.open(AddEditPetModalComponent);
  modalRef.componentInstance.mode = 'add';
  modalRef.result
    .then((formData: FormData) => {
      this.petsService.addPet(formData).subscribe({
        next: () => this.refreshPets(),
        error: err => console.error('Error agregando mascota:', err)
      });
    })
    .catch(() => {});
}


openEditPetModal(pet: Pet): void {
  const modalRef = this.modalService.open(AddEditPetModalComponent);
  modalRef.componentInstance.mode = 'edit';
  modalRef.componentInstance.pet = pet;
  modalRef.result
    .then((formData: FormData) => {
      this.petsService.updatePet(pet.id, formData).subscribe({
        next: () => this.refreshPets(),
        error: err => console.error('Error actualizando mascota:', err)
      });
    })
    .catch(() => {});
}
  

  deletePet(id: string): void {
    if (!confirm('¿Eliminar esta mascota?')) return;
    this.petsService.deletePet(id).subscribe({
      next: () => this.refreshPets(),
      error: err => console.error('Error eliminando mascota', err)
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  private refreshPets(): void {
    this.petsService.listPets().subscribe({
      next: (resp: any) => {
        this.pets = Array.isArray(resp) ? resp : resp.pets ?? [];
      },
      error: err => console.error('Error recargando mascotas', err),
    });
  }
}