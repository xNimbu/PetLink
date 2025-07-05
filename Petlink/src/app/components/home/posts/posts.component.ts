// src/app/components/home/posts/posts.component.ts
import { Component, OnInit, OnChanges, SimpleChanges, inject, Output, EventEmitter, Inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfileService } from '../../../services/profile/profile.service';
import { PostsService } from '../../../services/posts/posts.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CommentPostService } from '../../../services/commentsPost/comment-post.service';

import { Profile } from '../../../models/profile/profile.model';
import { Post } from '../../../models';  // asegúrate de que aquí Post incluya pet_id, comments, etc.
import { filter, first, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit, OnChanges {
  @Output() postsChange = new EventEmitter<Post[]>();

  /** UID del perfil del cual mostrar los posts. Si es null se usan los del usuario actual */
  @Input() uid: string | null = null;

  /** Indica si se muestran los posts del propio usuario */
  isOwnProfile = true;

  posts: Post[] = [];
  user!: Profile;
  loading = true;
  errorMsg = '';

  private subscriptions = new Subscription();

  /** IDs de los posts que el usuario ha marcado con “like” */
  likedPostIds = new Set<string>();

  /** Control de visibilidad y contenido del formulario de comentario */
  commentFormVisible: Record<string, boolean> = {};
  newComment: Record<string, string> = {};

  private profileService = inject(ProfileService);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private commentService = inject(CommentPostService);
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.initFeed();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['uid'] && !changes['uid'].firstChange) {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
      this.posts = [];
      this.likedPostIds.clear();
      if (isPlatformBrowser(this.platformId)) {
        this.initFeed();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initFeed(): void {
    // Re-cargar posts cuando se crea uno nuevo solo si es el propio perfil
    if (!this.uid || this.uid === this.authService.uid) {
      this.subscriptions.add(
        this.postsService.postCreated$.subscribe(() => this.loadPosts(this.user))
      );
    }

    // Esperar a que AuthService esté listo y luego obtener perfil
    this.subscriptions.add(
      this.authService.ready$.pipe(
        filter(ready => ready),
        first(),
        switchMap(() => {
          if (this.uid && this.uid !== this.authService.uid) {
            this.isOwnProfile = false;
            return this.profileService.getPublicProfile(this.uid);
          }
          this.isOwnProfile = true;
          return this.profileService.getProfile();
        })
      ).subscribe({
        next: profile => {
          this.user = profile;
          this.loadPosts(profile);
        },
        error: err => {
          console.error('Error cargando perfil', err);
          this.errorMsg = 'No se pudo cargar tu perfil.';
          this.loading = false;
        }
      })
    );
  }

  /** Trae todos los posts para el perfil actual */
  private loadPosts(profile: Profile): void {
    this.loading = true;
    const source = this.isOwnProfile ? this.postsService.getUserPosts() : null;

    if (source) {
      source.subscribe({
        next: data => this.populatePosts(data, profile),
        error: err => {
          console.error('Error cargando posts', err);
          this.loading = false;
        }
      });
    } else {
      const data = profile.posts ?? [];
      this.populatePosts(data as Post[], profile);
    }
  }

  private populatePosts(data: Post[], profile: Profile): void {
    this.likedPostIds.clear();
    this.posts = data.map(p => {
      const liked = p.likes?.some(l => l.uid === this.authService.uid);
      if (liked) this.likedPostIds.add(p.id);
      return {
        ...p,
        // Datos de usuario para mostrar
        username: profile.username,
        userAvatar: profile.photoURL,

        // Nombre de la mascota si pet_id está presente
        petName: p.pet_id
          ? (profile.pets?.find(x => x.id === p.pet_id)?.name ?? '')
          : '',

        // Aseguramos que comments exista (viene anidado desde el backend)
        comments: p.comments ?? [],
        likesCount: p.likesCount ?? 0
      } as Post;
    });
    this.postsChange.emit(this.posts);
    this.loading = false;
  }

  }

  /** Alterna el estado de “like” usando el backend */
  public toggleLike(id: string): void {
    this.postsService.toggleLike(id).subscribe({
      next: res => {
        if (res.liked) {
          this.likedPostIds.add(id);
        } else {
          this.likedPostIds.delete(id);
        }
        const target = this.posts.find(p => p.id === id);
        if (target) {
          target.likesCount = res.count;
        }
      },
      error: err => console.error('Error toggling like', err)
    });
  }

  /** Devuelve true si un post está marcado con “like” */
  public isLiked(id: string): boolean {
    return this.likedPostIds.has(id);
  }

  /** Elimina un post y limpia estado local */
  public deletePost(id: string): void {
    if (!this.isOwnProfile) return;
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.likedPostIds.delete(id);
      },
      error: err => console.error('Error eliminando post', err)
    });
  }

  /** Alterna el formulario de comentar para un post */
  public toggleCommentForm(postId: string): void {
    this.commentFormVisible[postId] = !this.commentFormVisible[postId];
  }

  /** Envía el nuevo comentario al backend y lo añade localmente */
  public submitComment(postId: string): void {
    const message = (this.newComment[postId] || '').trim();
    if (!message) return;

    this.commentService.addComment(postId, message).subscribe({
      next: res => {
        // Creamos el objeto comment con la respuesta
        const now = new Date().toISOString();
        const comment = {
          id: (res as any).id || '',   // ajusta según tu modelo
          userId: this.user.uid,
          username: this.user.username,
          message,
          timestamp: now
        };

        // Lo añadimos al post correspondiente
        const target = this.posts.find(p => p.id === postId);
        if (target) {
          target.comments = [...(target.comments || []), comment];
        }

        // Limpiamos formulario
        this.newComment[postId] = '';
        this.commentFormVisible[postId] = false;
      },
      error: err => console.error('Error al enviar comentario', err)
    });
  }
}
