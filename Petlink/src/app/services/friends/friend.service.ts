import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

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
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  list(): Observable<{ friends: Friend[] }> {
    return this.http.get<{ friends: Friend[] }>(
      `${this.baseUrl}/profile/friends/`,
      this.auth.getAuthHeaders()
    );
  }

  add(uid: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/profile/friends/`,
      { uid },
      this.auth.getAuthHeaders()
    );
  }

  remove(uid: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/profile/friends/${uid}/`,
      this.auth.getAuthHeaders()
    );
  }
}
