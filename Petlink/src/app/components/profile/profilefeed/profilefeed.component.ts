// import { Component } from '@angular/core';
//
// @Component({
//   selector: 'app-profilefeed',
//   standalone: true,
//   imports: [],
//   templateUrl: './profilefeed.component.html',
//   styleUrl: './profilefeed.component.scss'
// })
// export class ProfilefeedComponent {
//   user = {
//     fullName: 'Luis Illanes',
//     username: 'xNimbu',
//     photoURL: 'assets/images/default-user.png'
//   };
// }

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import {
  ProfileService,
  Profile,
  Pet
} from '../../../services/profile/profile.service';

@Component({
  selector: 'app-profilefeed',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './profilefeed.component.html',
  styleUrl: './profilefeed.component.scss'
})
export class ProfilefeedComponent implements OnInit {
  user!: Profile;
  profileFields: { label: string; value: string }[] = [];
  pets: Pet[] = [];
  petPhotos = [
    'assets/images/miw1.png',
    'assets/images/miw2.png',
    'assets/images/miw3.png',
    'assets/images/miw4.png',
    'assets/images/miw5.png',
    'assets/images/miw6.png',
    'assets/images/miw7.png',
    'assets/images/miw8.png',
    'assets/images/miw9.png'
  ];
  friends = [
  { name: 'Sofía Martínez', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Carlos Pérez', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Fernanda Ríos', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Mateo Vargas', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Camila Soto', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Ignacio Bravo', photoURL: 'assets/images/nophoto_avatar.jpg' },
  { name: 'Valentina Araya', photoURL: 'assets/images/nophoto_avatar.jpg' },
  ];
  posts = [
    {
      time: 'Hace 2 horas',
      content: '¿Qué miras, cochinocu?',
      image: 'assets/images/miw1.png',
    },
    {
      time: 'Hace 1 día',
      content: '¡Con Pelusa!',
      image: 'assets/images/miw2.png',
    },
    {
      time: 'Hace 3 días',
      content: 'Observándote.',
      image: 'assets/images/miw3.png',
    },
    {
      time: 'Hace 5 días',
      content: 'A mimir.',
      image: 'assets/images/miw4.png',
    }
  ]

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private modalService: NgbModal
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

        this.user = profile;
        this.profileFields = [
          { label: 'Nombre completo',     value: this.user.fullName },
          { label: 'Correo electrónico',  value: this.user.email    },
          { label: 'Teléfono',            value: this.user.phone    },
          { label: 'Tipo de usuario',     value: this.user.role     },
        ];
        this.pets = profile.pets ?? [];
      });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

//  editBio(){
//    const modalRef = this.modalService.open(EditBioModalComponent);
//    modalRef.componentInstance.bio = this.user.bio;
//
//    modalRef.result.then(result => {
//      if (result) this.user.bio = result;
//    }).catch(() => {});
//  }
}