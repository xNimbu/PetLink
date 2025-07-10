/// src/app/components/profile/profilefeed/profilefeed.component.ts
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
import { ProfilePostsComponent } from "./profile-posts/profile-posts.component";
import { AddPostComponent } from '../home/add-post/add-post.component';
import { Profile } from '../../models/profile/profile.model';
import { Pet } from '../../models/pet/pet.model';
import { Friend } from '../../models/friend/friend.model';
import { LoadingService } from '../../services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    DetailProfileComponent,
    ProfilePostsComponent,
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
  public auth = inject(AuthService);
  private friendService = inject(FriendService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);
  private subs = new Subscription();
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    // No ejecutar en SSR
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    // Cachear amigos al cargar el componente
    this.subs.add(
      this.friendService.cacheFriends().subscribe()
    );
    this.loadingService.show();

    this.subs.add(
      this.route.paramMap
        .pipe(
          switchMap(params =>
            this.auth.ready$.pipe(
              filter(r => r),
              first(),
              switchMap(() => {
                const username = params.get('username');
                const uidParam = params.get('uid');
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
                this.loadingService.hide();
                return of<Profile | null>(null);
              })
            )
          )
        )
        .subscribe(profile => {
          if (!profile) return;
          this.user = profile;
          this.isOwnProfile = profile.uid === this.auth.uid;
          this.buildProfileFields();
          this.pets = profile.pets ?? [];
          this.petPhotos = (profile.posts ?? [])
            .filter(p => !!p.photoURL)
            .map(p => p.photoURL!);
          this.friends = profile.friends ?? [];
          if (!this.isOwnProfile && this.auth.isLoggedIn) {
            this.friendService.list().subscribe({
              next: resp => {
                this.isFriend = resp.friends.some(f => f.uid === profile.uid);
              },
              error: () => {
                // ignore unauthorized errors if not logged in
              }
            });
          }
          this.loading = false;
          this.loadingService.hide();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }

  addFriend(): void {
    if (!this.user) return;

    this.auth.ready$.pipe(
      filter(r => r), first()
    ).subscribe(() => {
      const targetUid = this.user.uid ?? (this.user as any).id;
      if (!targetUid) { 
        this.toastr.error('No se pudo obtener el ID del usuario.', 'Error');
        return;
      }

      this.friendService.add(targetUid).subscribe({
        next: () => { 
          this.isFriend = true; 
          this.toastr.success('Solicitud de amistad enviada', 'Éxito');
        },
        error: () => {
          this.toastr.error('No se pudo enviar la solicitud de amistad.', 'Error');
        }
      });
    });
  }

  removeFriend(): void {
    if (!this.user) return;
    if (!confirm('¿Estás seguro de que quieres eliminar a este amigo?')) return;

    this.friendService.remove(this.user.uid).subscribe({
      next: () => {
        this.isFriend = false;
        this.toastr.success('Amigo eliminado correctamente', 'Éxito');
      },
      error: () => {
        this.toastr.error('No se pudo eliminar al amigo.', 'Error');
      }
    });
  }

  private buildProfileFields() {
    this.profileFields = [
      { label: 'Nombre completo', value: this.user.fullName },
      { label: 'Correo electrónico', value: this.user.email },
      { label: 'Teléfono', value: this.user.phone ? this.user.phone : 'No disponible' },
      { label: 'Tipo de usuario', value: this.user.role }
    ];
  }
}
