import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  type: string;
  photoURL: string;
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
  friends: Friends[];
}

export interface Post {
  timestamp: string;
  content: string;
  photoURL?: string;
  id: string;
}

export interface Friends {
  uid: string;
  username: string;
  avatar: string;
  addedAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private base = `${environment.backendUrl}/profile`;

  constructor(
    private http: HttpClient
  ) { }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.base}/`);
  }

  updateProfile(data: Partial<Profile>): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.base}/`, data, { headers });
  }

  updateProfileForm(formData: FormData): Observable<any> {
    return this.http.put(`${this.base}/`, formData);
  }

  listPets(): Observable<{ pets: Pet[] }> {
    return this.http.get<{ pets: Pet[] }>(`${this.base}/pets/`);
  }

  addPet(pet: Omit<Pet, 'id'>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.base}/pets/`, pet);
  }

  updatePet(id: string, changes: Partial<Pet>): Observable<any> {
    return this.http.put(`${this.base}/pets/${id}/`, changes);
  }

  deletePet(id: string): Observable<any> {
    return this.http.delete(`${this.base}/pets/${id}/`);
  }
}
