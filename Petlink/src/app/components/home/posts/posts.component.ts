// src/app/components/home/posts/posts.component.ts
import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { ProfileService }     from '../../../services/profile/profile.service';
import { AuthService }        from '../../../services/auth/auth.service';
import { CommentPostService } from '../../../services/commentsPost/comment-post.service';

import { Profile } from '../../../models/profile/profile.model';
import { Post }    from '../../../models';  // asegúrate de que aquí Post incluya pet_id, comments, etc.

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit {
  @Output() postsChange = new EventEmitter<Post[]>();

  posts: Post[] = [];
  user!: Profile;
  loading = true;
  errorMsg = '';

  /** IDs de los posts que el usuario ha marcado con “like” */
  likedPostIds = new Set<string>();

  /** Control de visibilidad y contenido del formulario de comentario */
  commentFormVisible: Record<string, boolean> = {};
  newComment:        Record<string, string>  = {};

  private profileService   = inject(ProfileService);
  private authService      = inject(AuthService);
  private commentService   = inject(CommentPostService);

  ngOnInit(): void {
    this.authService.ready$.subscribe(isReady => {
      if (isReady) {
        this.initFeed();
      }
    });
  }

  /** 1) Carga el perfil, 2) carga los posts con sus comentarios anidados */
  private initFeed(): void {
    // Si se crea un post, volvemos a cargar
    this.profileService.postCreated$.subscribe(() => this.loadPosts());

    // Primero perfil → luego posts
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

  /** Trae todos los posts (incluyen comments, pet_id, etc.) desde el backend */
  private loadPosts(): void {
    this.loading = true;
    this.profileService.getUserPosts().subscribe({
      next: data => {
        this.posts = data.map(p => ({
          ...p,
          // Datos de usuario para mostrar
          username:   this.user.username,
          userAvatar: this.user.photoURL,

          // Nombre de la mascota si pet_id está presente
          petName: p.pet_id
            ? (this.user.pets.find(x => x.id === p.pet_id)?.name ?? '')
            : '',

          // Aseguramos que comments exista (viene anidado desde el backend)
          comments: p.comments ?? []
        }));

        this.postsChange.emit(this.posts);
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando posts', err);
        this.loading = false;
      }
    });
  }

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

  /** Elimina un post y limpia estado local */
  public deletePost(id: string): void {
    this.profileService.deletePost(id).subscribe({
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
          id:        (res as any).id || '',   // ajusta según tu modelo
          userId:    this.user.uid,
          username:  this.user.username,
          message,
          timestamp: now
        };

        // Lo añadimos al post correspondiente
        const target = this.posts.find(p => p.id === postId);
        if (target) {
          target.comments = [...(target.comments || []), comment];
        }

        // Limpiamos formulario
        this.newComment[postId]        = '';
        this.commentFormVisible[postId] = false;
      },
      error: err => console.error('Error al enviar comentario', err)
    });
  }
}
