import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, from, switchMap, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Post } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private base = `${environment.backendUrl}/profile/posts`;
  private postCreatedSubject = new Subject<Post>();
  postCreated$ = this.postCreatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /** Obtiene y desenvuelve los posts del usuario */
  getUserPosts(): Observable<Post[]> {
    return this.http
      .get<{ posts: Post[] }>(`${this.base}/`, this.auth.getAuthHeaders())
      .pipe(
        map(res => res.posts.map(raw => ({
          id: raw.id,
          content: raw.content,
          photoURL: raw.photoURL,
          timestamp: raw.timestamp,
          pet_id: raw.pet_id,
          comments: raw.comments,
          likes: raw.likes,
          likesCount: raw.likesCount
        })))
      );
  }

  /** Obtiene los posts públicos de otro usuario por UID */
  getPostsByUid(uid: string): Observable<Post[]> {
    return this.http
      .get<{ posts: Post[] }>(`${this.base}/user/${uid}/`, this.auth.getAuthHeaders())
      .pipe(
        map(res => res.posts.map(raw => ({
          id: raw.id,
          content: raw.content,
          photoURL: raw.photoURL,
          timestamp: raw.timestamp,
          pet_id: raw.pet_id,
          comments: raw.comments,
          likes: raw.likes,
          likesCount: raw.likesCount
        })))
      );
  }

  /** Posts de usuario y amigos mezclados */
  getFriendsPosts(): Observable<Post[]> {
    const url = `${environment.backendUrl}/profile/friends/posts/`;
    return this.http
      .get<{ posts: any[] }>(url, this.auth.getAuthHeaders())
      .pipe(
        map(res => res.posts.map(raw => ({
          id: raw.id,
          content: raw.content,
          photoURL: raw.photoURL,
          timestamp: raw.timestamp,
          pet_id: raw.pet_id,
          comments: raw.comments,
          likes: raw.likes,
          likesCount: raw.likesCount,
          username: raw.owner?.username,
          userAvatar: raw.owner?.avatar
        } as Post)))
      );
  }

  /** Crea un post de solo texto */
  createPost(post: { content: string }): Observable<Post> {
    return this.http
      .post<Post>(`${this.base}/`, post, this.auth.getAuthHeaders())
      .pipe(tap(p => this.postCreatedSubject.next(p)));
  }

  /** Crea un post con imagen usando FormData */
  createPostWithImage(formData: FormData): Observable<any> {
    return from(this.auth.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post(`${this.base}/`, formData, { headers });
      })
    );
  }

  updatePost(id: string, data: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.base}/${id}/`, data, this.auth.getAuthHeaders());
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}/`, this.auth.getAuthHeaders());
  }

  /** Obtiene los likes de un post */
  getLikes(postId: string): Observable<{ count: number; likes: any[] }> {
    const url = `${environment.backendUrl}/posts/${postId}/likes/`;
    return this.http.get<{ count: number; likes: any[] }>(url, this.auth.getAuthHeaders());
  }

  /** Alterna el like de un post */
  toggleLike(postId: string): Observable<{ liked: boolean; count: number; likes: any[] }> {
    const url = `${environment.backendUrl}/posts/${postId}/likes/`;
    return this.http.post<{ liked: boolean; count: number; likes: any[] }>(url, {}, this.auth.getAuthHeaders());
  }
}
