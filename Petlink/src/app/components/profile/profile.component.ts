// src/app/components/profile/profilefeed/profilefeed.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, of } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';

import { AuthService } from '../../services/auth/auth.service';
import { ProfileService } from '../../services/profile/profile.service';
import { FriendService } from '../../services/friends/friend.service';
import { DetailProfileComponent } from "./detail-profile/detail-profile.component";
import { PostsComponent } from "../home/posts/posts.component";
import { AddPostComponent } from '../home/add-post/add-post.component';
import { Profile } from '../../models/profile/profile.model';
import { Pet } from '../../models/pet/pet.model';
import { Friend } from '../../models/friend/friend.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    DetailProfileComponent,
    PostsComponent,
    AddPostComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: Profile;
  loading = true;
  errorMsg = '';
  profileFields: { label: string; value: string }[] = [];
  pets: Pet[] = [];
  petPhotos: string[] = [];
  friends: Friend[] = [];
  isOwnProfile = true;
  isFriend = false;

  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private friendService = inject(FriendService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private subs = new Subscription();

  ngOnInit(): void {
    // No ejecutar en SSR
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    // Esperar a que AuthService esté listo, luego cargar TODO lo necesario
    this.subs.add(
      this.authService.ready$
        .pipe(
          filter(ready => ready),
          first(),
          switchMap(() => {
            const username = this.route.snapshot.paramMap.get('username');
            const uidParam = this.route.snapshot.paramMap.get('uid');
            if (username) {
              return this.profileService.getProfileByUsername(username);
            }
            if (uidParam) {
              return this.profileService.getPublicProfile(uidParam);
            }
            return this.profileService.getProfile();
          }),
          catchError(err => {
            console.error('Error al cargar perfil:', err);
            this.errorMsg = 'No se pudo cargar el perfil.';
            this.loading = false;
            return of<Profile | null>(null);
          })
        )
        .subscribe(profile => {
          if (!profile) return;
          this.user = profile;
          this.isOwnProfile = profile.uid === this.authService.uid;
          this.buildProfileFields();
          this.pets = profile.pets ?? [];
          this.petPhotos = (profile.posts ?? [])
            .filter(p => !!p.photoURL)
            .map(p => p.photoURL!);
          this.friends = profile.friends ?? [];
          if (!this.isOwnProfile) {
            this.friendService.list().subscribe(resp => {
              this.isFriend = resp.friends.some(f => f.uid === profile.uid);
            });
          }
          this.loading = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  addFriend(): void {
    if (!this.user) return;
    this.friendService.add(this.user.uid).subscribe(() => {
      this.isFriend = true;
    });
  }

  private buildProfileFields() {
    this.profileFields = [
      { label: 'Nombre completo', value: this.user.fullName },
      { label: 'Correo electrónico', value: this.user.email },
      { label: 'Teléfono', value: this.user.phone? this.user.phone : 'No disponible' },
      { label: 'Tipo de usuario', value: this.user.role }
    ];
  }
}
