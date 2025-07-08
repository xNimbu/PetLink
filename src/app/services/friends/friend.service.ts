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
  private friendsSet: Set<string> = new Set<string>();

  // Utilidades
  // Guarda en caché la lista de amigos
  //cache(uids: string[]) {
  //  this.friendsSet = new Set(uids);
  //}

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // Obtiene y cachea la lista de amigos del usuario
  cacheFriends(): Observable<{ friends: Friend[] }> {
    return new Observable(observer => {
      this.http.get<{ friends: Friend[] }>(
        `${this.baseUrl}/profile/friends/`,
        this.auth.getAuthHeaders()
      ).subscribe({
        next: res => {
          res.friends.forEach(f => this.friendsSet.add(f.uid));
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  // Verifica si un uid ya está en la lista de amigos
  has(uid: string): boolean {
    return this.friendsSet.has(uid);
  }

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

  /* ----------------------------------------------------------------
     NUEVO  –  envío de solicitud desde el buscador
     POST /profile/friend_request/  { uid }
     ---------------------------------------------------------------- */
  sendFriendRequest(toUid: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/profile/friends/`,
      { uid: toUid },
      this.auth.getAuthHeaders()
    );
  }
}
