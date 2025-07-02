// src/app/components/home/posts/posts.component.ts
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, Post, Profile } from '../../../services/profile/profile.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Output, EventEmitter } from '@angular/core';
import { filter, first, firstValueFrom, from, Subscription, switchMap } from 'rxjs';

interface DisplayPost extends Post {
  username: string;
  userAvatar: string;
  pet_id?: string;
  petName?: string;
  petPhoto?: string;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit {
  @Output() postsChange = new EventEmitter<DisplayPost[]>();

  /* --------------------- PROPIEDADES ----------------------------------- */
  posts: DisplayPost[] = [];
  user!: Profile;
  loading = true;
  errorMsg = '';

  private subscriptions = new Subscription();

  /** IDs de los posts que el usuario ha marcado con “like” */
  likedPostIds = new Set<string>();

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.initFeed();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initFeed(): void {
    // Re-cargar posts cuando se crea uno nuevo
    this.subscriptions.add(
      this.profileService.postCreated$.subscribe(() => this.loadPosts())
    );

    // Esperar a que AuthService esté listo y luego obtener perfil
    this.subscriptions.add(
      this.authService.ready$.pipe(
        filter(ready => ready),
        first(),
        switchMap(() => this.profileService.getProfile())
      ).subscribe({
        next: profile => {
          this.user = profile;
          this.loadPosts();
        },
        error: err => {
          console.error('Error cargando perfil', err);
          this.errorMsg = 'No se pudo cargar tu perfil.';
          this.loading = false;
        }
      })
    );
  }


  private loadPosts(): void {
    this.loading = true;
    this.profileService.getUserPosts().subscribe({
      next: data => {
        this.posts = data.map(p => ({
          ...p,
          username: this.user.username,
          userAvatar: this.user.photoURL
        }));
        this.posts = this.posts.map(post => {
          if (post.pet_id) {
            const pet = this.user.pets.find(x => x.id === post.pet_id);
            if (pet) {
              return {
                ...post,
                petName: pet.name,
                petPhoto: pet.photoURL
              };
            }
          }
          return post;
        });
        this.postsChange.emit(this.posts);
        this.loading = false;
      },
    });

  }

  /* --------------------- ACCIONES DEL USUARIO -------------------------- */
  /** Alterna el estado de “like” SOLO en el front-end */
  public toggleLike(id: string): void {
    if (this.likedPostIds.has(id)) {
      this.likedPostIds.delete(id);
    } else {
      this.likedPostIds.add(id);
    }
  }

  /** Devuelve true si un post está marcado con “like” */
  public isLiked(id: string): boolean {
    return this.likedPostIds.has(id);
  }

  public deletePost(id: string): void {
    this.profileService.deletePost(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.likedPostIds.delete(id);           // limpia estado local
      },
      error: err => console.error('Error eliminando post', err)
    });
  }
  /* --------------------- FIN DE LA CLASE ------------------------------- */
}