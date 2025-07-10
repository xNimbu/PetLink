import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map, Observable } from 'rxjs';
import { AddCommentResponse, CommentsResponse, Comment } from '../../models/folderComments/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentPostService {
private baseUrl = `${environment.backendUrl}/posts`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private mapComment(raw: any): Comment {
    return {
      id: raw.id,
      userId: String(raw.userId ?? raw.uid ?? raw.owner?.uid ?? raw.user_id ?? ''),
      username: raw.username ?? raw.owner?.username ?? '',
      message: raw.message,
      timestamp: raw.timestamp,
      photoURL: raw.photoURL ?? raw.owner?.avatar ?? ''
    } as Comment;
  }

  // GET original, sin cambios
  getComments(postId: string): Observable<Comment[]> {
    const url = `${this.baseUrl}/${postId}/comments/`;
    console.log(url)
    return this.http
      .get<CommentsResponse>(url, this.auth.getAuthHeaders())
      .pipe(map(res => res.comments.map(c => this.mapComment(c))));
  }

  // POST que recibe sólo { mensaje, id }
  addComment(postId: string, message: string): Observable<AddCommentResponse> {
    const url = `${this.baseUrl}/${postId}/comments/`;
    return this.http.post<AddCommentResponse>(url, { message }, this.auth.getAuthHeaders());
  }

/** Actualiza un comentario existente (PUT) */
  updateComment(
    postId: string,
    commentId: string,
    message: string
  ): Observable<{ mensaje: string }> {
    const url = `${this.baseUrl}/${postId}/comments/${commentId}/`;
    return this.http.put<{ mensaje: string }>(
      url,
      { message },
      this.auth.getAuthHeaders()
    );
  }

  /** Elimina un comentario (DELETE) */
  deleteComment(
    postId: string,
    commentId: string
  ): Observable<{ mensaje: string }> {
    const url = `${this.baseUrl}/${postId}/comments/${commentId}/`;
    return this.http.delete<{ mensaje: string }>(
      url,
      this.auth.getAuthHeaders()
    );
  }

}
