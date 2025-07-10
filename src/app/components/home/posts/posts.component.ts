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
import { LoadingService } from '../../../services/loading/loading.service';

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
  /** Cuando es true se muestran posts del usuario y sus amigos */
  @Input() friendsFeed = false;

  /** Indica si se muestran los posts del propio usuario */
  isOwnProfile = true;

  posts: Post[] = [];
  user!: Profile;
  private viewerUid = '';
  private viewerUsername = '';
  loading = true;
  errorMsg = '';


  private subscriptions = new Subscription();

  /** IDs de los posts que el usuario ha marcado con “like” */
  likedPostIds = new Set<string>();

  /** Control de visibilidad y contenido del formulario de comentario */
  commentFormVisible: Record<string, boolean> = {};
  newComment: Record<string, string> = {};
  editMode: Record<string, boolean> = {};    // key = commentId
  editCommentText: Record<string, string> = {};    // key = commentId

  private profileService = inject(ProfileService);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private commentService = inject(CommentPostService);
  private loadingService = inject(LoadingService);
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /** Devuelve true si el comentario pertenece al usuario actual */
  public isCommentOwner(comment: any): boolean {
    const ownerId = String(comment.userId ?? comment.uid ?? comment.owner?.uid ?? comment.user_id ?? '');
    return ownerId === this.viewerUid;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Datos del usuario actual para comentar y para inicializar el feed
    this.profileService.getProfile().then(p => {
      this.viewerUid = p.uid;
      this.viewerUsername = p.username;
      this.user = p; // cachear para usarlo en el feed si es necesario
      this.initFeed();
    }).catch(() => {
      this.initFeed();
    });
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
    // Si es feed de amigos, solo obtenemos el perfil propio una vez
    if (this.friendsFeed) {
      this.isOwnProfile = false;

      // 1) Carga inicial de perfil y posts de amigos
      this.subscriptions.add(
        this.authService.ready$.pipe(
          filter(r => r),
          first(),
          switchMap(() => this.profileService.getProfile())
        ).subscribe({
          next: profile => {
            this.user = profile;
            this.loadFriendsPosts();
          },
          error: err => {
            console.error('Error cargando feed', err);
            this.errorMsg = 'No se pudo cargar el feed.';
            this.loading = false;
          }

        })
      );

      // 2) Suscribirse a postCreated$ para recargar SOLO cuando YO subo un post
      this.subscriptions.add(
        this.postsService.postCreated$
          .subscribe(() => {
            console.log('🔄 [PostsComponent] recargando feed de amigos tras crear post propio');
            this.loadFriendsPosts();
          })
      );

      return;
    }


    this.isOwnProfile = true;
    if (this.user) {
      this.loadPosts(this.user);
    }
    
    // Si es mi propio perfil, recargo posts al crear uno
    if (!this.uid || this.uid === this.authService.uid) {
      console.log('🟢 [PostsComponent] suscribiendo a postCreated$ en propio perfil');
      this.subscriptions.add(
        this.postsService.postCreated$
          .subscribe(() => {
            console.log('🔄 [PostsComponent] recargando posts tras crear uno propio');
            this.loadPosts(this.user);
          })
      );
    }

    // Luego cargo inicial de perfil (público o propio) y sus posts
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
    this.loadingService.show();
    let source: any;
    if (this.isOwnProfile) {
      source = this.postsService.getUserPosts();
    } else if (this.uid) {
      source = this.postsService.getPostsByUid(this.uid);
    }

    if (source) {
      source.subscribe({
        next: (data: Post[]) => this.populatePosts(data, profile),
        error: (err: Post[]) => {
          console.error('Error cargando posts', err);
          this.loading = false;
          this.loadingService.hide();
        }
      });
    } else {
      const data = profile.posts ?? [];
      this.populatePosts(data as Post[], profile);
    }
  }

  private loadFriendsPosts(): void {
    this.loading = true;
    this.loadingService.show();
    this.postsService.getFriendsPosts().subscribe({
      next: (data: Post[]) => this.populatePosts(data, null),
      error: err => {
        console.error('Error cargando posts', err);
        this.loading = false;
        this.loadingService.hide();
      }
    });
  }

  private populatePosts(data: Post[], profile: Profile | null): void {
    this.likedPostIds.clear();
    this.posts = data.map(p => {
      const liked = p.likes?.some(l => l.uid === this.authService.uid);
      if (liked) this.likedPostIds.add(p.id);
      const username = p.username ?? profile?.username ?? '';
      const userAvatar = p.userAvatar ?? profile?.photoURL ?? '';
      const petName = (p.petName ?? (p.pet_id && profile?.pets?.find(x => x.id === p.pet_id)?.name)) || '';
      return {
        ...p,
        username,
        userAvatar,
        petName,
        comments: p.comments ?? [],
        likesCount: p.likesCount ?? 0
      } as Post;
    });
    this.postsChange.emit(this.posts);
    this.loading = false;
    this.loadingService.hide();
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
        const now = new Date().toISOString();
        const comment = {
          id: (res as any).id || '',
          userId: this.viewerUid,
          username: this.viewerUsername,
          message,
          timestamp: now,
          photoURL: this.user?.photoURL || ''
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

  /** Entra en modo edición para un comentario */
  public enableEdit(postId: string, commentId: string, currentText: string): void {
    const post = this.posts.find(p => p.id === postId);
    const comment = post?.comments?.find(c => c.id === commentId);
    if (!comment || !this.isCommentOwner(comment)) return;

    this.editMode[commentId] = true;
    this.editCommentText[commentId] = currentText;
  }

  /** Cancela la edición */
  public cancelEdit(commentId: string): void {
    this.editMode[commentId] = false;
    delete this.editCommentText[commentId];
  }

  /** Guarda la edición enviándola al backend */
  public saveEdit(postId: string, commentId: string): void {
    const newMsg = (this.editCommentText[commentId] || '').trim();
    if (!newMsg) return;

    const post = this.posts.find(p => p.id === postId);
    const comment = post?.comments?.find(c => c.id === commentId);
    if (!comment || !this.isCommentOwner(comment)) return;

    this.commentService.updateComment(postId, commentId, newMsg).subscribe({
      next: () => {
        // Actualiza en el frontend
        const post = this.posts.find(p => p.id === postId);
        if (post && post.comments) {
          post.comments = post.comments.map(c =>
            c.id === commentId ? { ...c, message: newMsg } : c
          );
        }
        this.cancelEdit(commentId);
      },
      error: err => console.error('Error actualizando comentario', err)
    });
  }

  /** Elimina un comentario */
  public deleteComment(postId: string, commentId: string): void {
    const post = this.posts.find(p => p.id === postId);
    const comment = post?.comments?.find(c => c.id === commentId);
    if (!comment || !this.isCommentOwner(comment)) return;
    if (!confirm('¿Eliminar este comentario?')) return;

    this.commentService.deleteComment(postId, commentId).subscribe({
      next: () => {
        const post = this.posts.find(p => p.id === postId);
        if (post && post.comments) {
          post.comments = post.comments.filter(c => c.id !== commentId);
        }
      },
      error: err => console.error('Error eliminando comentario', err)
    });
  }
}
