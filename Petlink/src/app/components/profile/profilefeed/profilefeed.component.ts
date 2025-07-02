import { CommonModule } from '@angular/common';
import { Component, inject, Input, input, OnInit, Output } from '@angular/core';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { DetailProfileComponent } from "../detail-profile/detail-profile.component";
import { PostsComponent } from "../../home/posts/posts.component";
import { AddPostComponent } from '../../home/add-post/add-post.component';
import { Profile } from '../../../models/profile/profile.model';
import { Pet } from '../../../models/pet/pet.model';
import { Friend } from '../../../models/friend/friend.model';

@Component({
  selector: 'app-profilefeed',
  standalone: true,
  imports: [CommonModule, NgbModule, DetailProfileComponent, PostsComponent, AddPostComponent],
  templateUrl: './profilefeed.component.html',
  styleUrl: './profilefeed.component.scss'
})
export class ProfilefeedComponent implements OnInit {
  user!: Profile;
  loading = true;
  profileFields: { label: string; value: string }[] = [];
  pets: Pet[] = [];
  petPhotos: any[] = [];
  friends: Friend[] = [];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) { }

  ngOnInit(): void {
    this.loadFriends()
    this.loadPetPhotosFromProfile()
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
          { label: 'Nombre completo', value: this.user.fullName },
          { label: 'Correo electrónico', value: this.user.email },
          { label: 'Teléfono', value: this.user.phone },
          { label: 'Tipo de usuario', value: this.user.role },
        ];
        this.pets = profile.pets ?? [];
      });
  }

  loadPetPhotosFromProfile(): void {
    this.profileService.getProfile()
      .pipe(
        catchError(err => {
          console.error('Error al cargar perfil:', err);
          return of<Profile | null>(null);
        })
      )
      .subscribe(profile => {
        if (!profile || !profile.posts) {
          this.petPhotos = [];
          return;
        }
        this.petPhotos = profile.posts
          .filter(post => !!post.photoURL)
          .map(post => post.photoURL);
      });
  }

  loadFriends(): void {
    this.profileService.getProfile()
      .pipe(
        catchError(err => {
          console.error('Error al cargar amigos:', err);
          return of<Profile | null>(null);
        })
      )
      .subscribe(profile => {
        if (!profile || !profile.friends) {
          this.friends = [];
          return;
        }
        this.friends = profile.friends
      });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

}