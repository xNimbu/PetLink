// src/app/components/profile/profile.component.ts
import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, of } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';

import { AddEditPetModalComponent } from './add-edit-pet/add-edit-pet.component';
import { EditComponent } from './edit/edit.component';
import { ProfileService } from '../../services/profile/profile.service';
import { AuthService } from '../../services/auth/auth.service';
import { Pet, Profile } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: Profile;
  pets: Pet[] = [];
  errorMsg = '';
  loading = true;

  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private modalService = inject(NgbModal);
  private platformId = inject(PLATFORM_ID);
  private subs = new Subscription();

  ngOnInit(): void {
    // No en SSR
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    // Esperar token y luego cargar perfil
    this.subs.add(
      this.authService.ready$
        .pipe(
          filter(ready => ready),
          first(),
          switchMap(() => this.profileService.getProfile()),
          catchError(err => {
            console.error('Error al cargar perfil:', err);
            this.errorMsg = 'No se pudo cargar tu perfil.';
            this.loading = false;
            return of<Profile | null>(null);
          })
        )
        .subscribe(profile => {
          if (!profile) return;
          this.user = profile;
          this.pets = profile.pets ?? [];
          this.loading = false;
        })
    );
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

  openAddPetModal(): void {
    const modalRef = this.modalService.open(AddEditPetModalComponent);
    modalRef.componentInstance.mode = 'add';
    modalRef.result
      .then((formData: FormData) => this.profileService.addPet(formData))
      .then(() => this.reloadProfile())
      .catch(() => {});
  }

  openEditPetModal(pet: Pet): void {
    const modalRef = this.modalService.open(AddEditPetModalComponent);
    modalRef.componentInstance.mode = 'edit';
    modalRef.componentInstance.pet = pet;
    modalRef.result
      .then((formData: FormData) => this.profileService.updatePet(pet.id, formData))
      .then(() => this.reloadProfile())
      .catch(() => {});
  }

  deletePet(id: string): void {
    if (!confirm('¿Eliminar esta mascota?')) return;
    this.subs.add(
      this.profileService.deletePet(id)
        .subscribe(() => this.reloadProfile())
    );
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  private reloadProfile(): void {
    // Reutiliza la misma lógica de carga inicial
    this.loading = true;
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.ngOnInit();
  }
}
