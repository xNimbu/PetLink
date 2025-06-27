// src/app/components/home/posts/posts.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { ProfileService, Post, Profile } from '../../../services/profile/profile.service';
import { AuthService }    from '../../../services/auth/auth.service';

interface DisplayPost extends Post {
  username: string;
  userAvatar: string;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit {

  /* --------------------- PROPIEDADES ----------------------------------- */
  posts: DisplayPost[] = [];
  user!: Profile;
  loading = true;
  errorMsg = '';

  /** IDs de los posts que el usuario ha marcado con “like” */
  likedPostIds = new Set<string>();

  private profileService = inject(ProfileService);
  private authService    = inject(AuthService);

  /* --------------------- CICLO DE VIDA ---------------------------------- */
  ngOnInit(): void {
    this.authService.ready$.subscribe(isReady => {
      if (isReady) {
        this.initFeed();
      }
    });
  }

  /* --------------------- FLUJO PRINCIPAL -------------------------------- */
  private initFeed(): void {
    this.profileService.postCreated$.subscribe(() => this.loadPosts());

    this.profileService.getProfile().subscribe({
      next: profile => {
        this.user = profile;
        this.loadPosts();
      },
      error: err => {
        console.error('Error cargando perfil', err);
        this.errorMsg = 'No se pudo cargar tu perfil.';
        this.loading = false;
      }
    });
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
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando posts', err);
        this.errorMsg = 'No se pudieron cargar los posts.';
        this.loading = false;
      }
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
