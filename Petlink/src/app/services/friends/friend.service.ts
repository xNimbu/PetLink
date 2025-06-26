import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Friend {
  uid: string;
  username: string;
  avatar: string;
  addedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private baseUrl = environment.backendUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private authHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      // Entorno no-browser, devolvemos headers vacíos
      return new HttpHeaders();
    }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay token en localStorage');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  list(): Observable<{ friends: Friend[] }> {
    return this.http.get<{ friends: Friend[] }>(
      `${this.baseUrl}/profile/friends/`,
      { headers: this.authHeaders() }
    );
  }

  add(uid: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/profile/friends/`,
      { uid },
      { headers: this.authHeaders() }
    );
  }

  remove(uid: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/profile/friends/${uid}/`,
      { headers: this.authHeaders() }
    );
  }
}
