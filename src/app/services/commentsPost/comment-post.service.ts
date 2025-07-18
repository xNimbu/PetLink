import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // GET original, sin cambios
  getComments(postId: string): Observable<Comment[]> {
    const url = `${this.baseUrl}/${postId}/comments/`;
    console.log(url)
    return this.http
      .get<CommentsResponse>(url, { headers: this.buildHeaders() })
      .pipe(map(res => res.comments)); // Cambia 'comments' si tu API usa otro nombre
  }

  // POST que recibe sólo { mensaje, id }
  addComment(postId: string, message: string): Observable<AddCommentResponse> {
    const url = `${this.baseUrl}/${postId}/comments/`;
    const headers = this.buildHeaders();
    return this.http.post<AddCommentResponse>(url, { message }, { headers });
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
      { headers: this.buildHeaders() }
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
      { headers: this.buildHeaders() }
    );
  }

  private buildHeaders(): HttpHeaders {
    const token = this.auth.getIdToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}