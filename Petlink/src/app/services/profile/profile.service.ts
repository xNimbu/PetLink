import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
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
    return this.http.post(`${this.base}/`, data);
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
