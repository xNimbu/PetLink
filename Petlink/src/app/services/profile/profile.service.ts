// src/app/services/profile/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, from, map, Observable, Subject, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';



export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  type: string;
  photoURL: string;
}

export interface Post {
  timestamp: string;
  content: string;
  photoURL?: string;
  id: string;
}

export interface Friend {
  uid: string;
  username: string;
  avatar: string;
  addedAt: string;
}

export interface Profile {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  photoURL: string;
  pets: Pet[];
  posts: Post[];
  friends: Friend[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private base = `${environment.backendUrl}/profile`;
  private postCreatedSubject = new Subject<Post>();
  postCreated$ = this.postCreatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  /** Obtiene el perfil completo */
  async getProfile(): Promise<Profile> {
    // Esperar y obtener un ID token válido (lanza si no hay usuario)
    const token = await this.auth.getIdToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return firstValueFrom(
      this.http.get<Profile>(
        `${environment.backendUrl}/profile/`,
        { headers }
      )
    );
  }

  /** POST con FormData para incluir foto */
  updateProfileForm(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.base}/`,
      formData,
      this.auth.formOptions()
    );
  }

  /** Listar mascotas */
  listPets(): Observable<{ pets: Pet[] }> {
    return this.http.get<{ pets: Pet[] }>(
      `${this.base}/pets/`,
      this.auth.getAuthHeaders()
    );
  }

  /** Agregar nueva mascota con FormData si incluye foto */
  addPet(formData: FormData): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(
      `${this.base}/pets/`,
      formData,
      this.auth.formOptions()
    );
  }

  /** Editar mascota existente */
  updatePet(id: string, formData: FormData): Observable<any> {
    return this.http.put(
      `${this.base}/pets/${id}/`,
      formData,
      this.auth.formOptions()
    );
  }

  /** Eliminar mascota */
  deletePet(id: string): Observable<any> {
    return this.http.delete(
      `${this.base}/pets/${id}/`,
      this.auth.getAuthHeaders()
    );
  }

  /** Obtiene y desenvuelve los posts */
  getUserPosts(): Observable<Post[]> {
    return this.http
      .get<{
        posts: Array<{ id: string; content: string; photoURL: string; timestamp: string, pet_id?: string }>;
      }>(
        `${this.base}/posts/`,
        this.auth.getAuthHeaders()
      )
      .pipe(
        map(response =>
          response.posts.map(raw => ({
            id: raw.id,
            content: raw.content,
            photoURL: raw.photoURL,
            timestamp: raw.timestamp,
            pet_id: raw.pet_id
          }))
        )
      );
  }

  /**
   * Crea un post de solo texto (campo "content"), y emite el evento postCreated$
   */
  createPost(post: { content: string }): Observable<Post> {
    return this.http
      .post<Post>(
        `${this.base}/posts/`,
        post,
        this.auth.getAuthHeaders()
      )
      .pipe(
        tap(p => this.postCreatedSubject.next(p))
      );
  }

  /**
   * Crea un post con imagen mediante FormData (campo "content" + "image"),
   * y emite el evento postCreated$
   */
  createPostWithImage(formData: FormData) {
    return from(this.auth.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post(
          `${environment.backendUrl}/posts/`,
          formData,
          { headers }
        );
      })
    );
  }

  updatePost(id: string, data: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(
      `${this.base}/posts/${id}/`,
      data,
      this.auth.getAuthHeaders()
    );
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(
      `${this.base}/posts/${id}/`,
      this.auth.getAuthHeaders()
    );
  }
}
