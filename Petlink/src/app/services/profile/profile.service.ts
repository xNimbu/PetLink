// src/app/services/profile/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Profile } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private base = `${environment.backendUrl}/profile`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /** Obtiene el perfil completo */
  async getProfile(): Promise<Profile> {
    const token = await this.auth.getIdToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return firstValueFrom(
      this.http.get<Profile>(`${this.base}/`, { headers })
    );
  }

  /** Actualiza el perfil enviando un FormData */
  updateProfileForm(formData: FormData): Observable<any> {
    return this.http.post(`${this.base}/`, formData, this.auth.formOptions());
  }

  /** Obtiene un perfil público por UID */
  getPublicProfile(uid: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.base}/${uid}/`, this.auth.getAuthHeaders());
  }

  /** Obtiene un perfil público por nombre de usuario */
  getProfileByUsername(username: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.base}/username/${username}/`, this.auth.getAuthHeaders());
  }
}
