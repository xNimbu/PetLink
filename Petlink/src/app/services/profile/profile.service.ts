// src/app/services/profile/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  /** Obtiene el perfil completo */
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(
      `${this.base}/`,
      this.auth.getAuthHeaders()        // solo Authorization
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
}
