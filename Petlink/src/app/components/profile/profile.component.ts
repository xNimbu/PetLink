import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditComponent } from './edit/edit.component';
import { AuthService } from '../../services/auth/auth.service';
import { ProfileService } from '../../services/profile/profile.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  constructor(private modalService: NgbModal, private authService: AuthService, private profileService: ProfileService,) { }
  user = {
    fullName: 'Luis Illanes',
    username: 'xnimbu',
    email: '*******@gmail.com',
    phone: '*******123',
    role: 'Administrador',
    photoURL: 'assets/images/luis.png',
  };

  profileFields = [
    { label: 'Nombre completo', value: this.user.fullName },
    { label: 'Correo electrónico', value: this.user.email },
    { label: 'Teléfono', value: this.user.phone },
    { label: 'Tipo de usuario', value: this.user.role },
  ];

  pets = [
    {
      name: 'Fido',
      breed: 'Bull Terrier',
      age: 3,
      type: 'Perro',
      photoURL: 'assets/images/fido.png',
    },
    {
      name: 'Cachupin',
      breed: 'Golden Retriever',
      age: 2,
      type: 'Perro',
      photoURL: 'assets/images/cachupin.png',
    },
  ];

  ngOnInit(): void {
    this.profileService.getProfile()
      .pipe(
        catchError(err => {
          console.error('Error al cargar perfil:', err);
          return of(null); // para que no se rompa el stream
        })
      )
      .subscribe(profile => {
        console.log('🚀 Perfil cargado:', profile);
      });
  }

  openModal() {
    const modalRef = this.modalService.open(EditComponent, { size: 'lg' });
    modalRef.componentInstance.userData = { ...this.user }; // pasar los datos del usuario al modal

    modalRef.result.then((result) => {
      if (result) {
        this.user = {
          ...this.user,
          ...result
        };
        this.profileFields = [
          { label: 'Nombre completo', value: this.user.fullName },
          { label: 'Correo electrónico', value: this.user.email },
          { label: 'Teléfono', value: this.user.phone },
          { label: 'Tipo de usuario', value: this.user.role },
        ];
      }
    }).catch(() => { });
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }

}
