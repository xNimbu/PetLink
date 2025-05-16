import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';

import { EditComponent } from './edit/edit.component';
import { AuthService } from '../../services/auth/auth.service';
import {
  ProfileService,
  Profile,    // interfaz que devuelve tu API
  Pet         // si tu ProfileService exporta también Pet
} from '../../services/profile/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  // 1) Declaramos propiedades vacías para rellenar desde el servicio
  user!: Profile;
  profileFields: { label: string; value: string }[] = [];
  pets: Pet[] = [];

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile()
      .pipe(
        catchError(err => {
          console.error('Error al cargar perfil:', err);
          return of<Profile | null>(null);
        })
      )
      .subscribe(profile => {
        if (!profile) return;

        // 2) Asignamos directamente el objeto recibido
        this.user = profile;

        // 3) Creamos el array para el template
        this.profileFields = [
          { label: 'Nombre completo',     value: this.user.fullName },
          { label: 'Correo electrónico',  value: this.user.email    },
          { label: 'Teléfono',            value: this.user.phone    },
          { label: 'Tipo de usuario',     value: this.user.role     },
        ];

        // 4) Si tu API devuelve mascotas, las asignamos; si no, queda vacío
        this.pets = profile.pets ?? [];
      });
  }

  openModal(): void {
    const modalRef = this.modalService.open(EditComponent, { size: 'lg' });
    // 5) Pasamos al modal una copia de los datos actuales
    modalRef.componentInstance.userData = { ...this.user };

    modalRef.result
      .then(result => {
        if (result) {
          // 6) Actualizamos la vista si el modal devolvió cambios
          this.user = { ...this.user, ...result };
          this.profileFields = [
            { label: 'Nombre completo',     value: this.user.fullName },
            { label: 'Correo electrónico',  value: this.user.email    },
            { label: 'Teléfono',            value: this.user.phone    },
            { label: 'Tipo de usuario',     value: this.user.role     },
          ];
        }
      })
      .catch(() => {/* modal dismiss sin cambios */});
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
