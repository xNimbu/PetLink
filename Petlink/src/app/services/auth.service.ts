import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../enviroment/environment';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private idToken: string | null = null;

  constructor(
    private auth: Auth,
    private http: HttpClient
  ) { }

  /** Login con email/pwd y almacena token */
  async loginWithEmail(email: string, password: string): Promise<string> {
    const cred: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.idToken = await cred.user.getIdToken();
    return this.idToken!;
  }

  /** Login con Google y almacena token */
  async loginWithGoogle(): Promise<string> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.idToken = await result.user.getIdToken();
    return this.idToken!;
  }

  /** Llama a tu endpoint protegido en Django */
  async getProtectedData(): Promise<any> {
    if (!this.idToken) {
      throw new Error('No estás autenticado');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.idToken}`
    });
    // firstValueFrom convierte el Observable en Promise
    return firstValueFrom(this.http.get<any>(
      `${environment.backendUrl}/api/protegido/`,
      { headers }
    ));
  }
}