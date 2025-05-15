// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../enviroment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private idToken: string | null = null;

  constructor(
    private auth: Auth,
    private http: HttpClient
  ) { }

  private buildHeaders(includeAuth = false): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (includeAuth) {
      if (!this.idToken) throw new Error('No estás autenticado');
      headers = headers.set('Authorization', `Bearer ${this.idToken}`);
    }
    return headers;
  }
  private httpOptions(includeAuth = false) {
    return { headers: this.buildHeaders(includeAuth) };
  }

  async loginWithEmail(email: string, password: string): Promise<string> {
    const cred: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.idToken = await cred.user.getIdToken();
    return this.idToken!;
  }

  async loginWithGoogle(): Promise<string> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.idToken = await result.user.getIdToken();
    return this.idToken!;
  }

  /** Llama a tu endpoint protegido: usa environment.backendUrl tal cual */
  async getProtectedData(): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(
        `${environment.backendUrl}/protegido/`,
        this.httpOptions(true)
      )
    );
  }

  /** Registrar usuario: asume que tu ruta en Django es `/crear-usuario/` */
  register(email: string, password: string, nombre: string): Promise<{ uid: string }> {
    return firstValueFrom(
      this.http.post<{ uid: string }>(
        `${environment.backendUrl}/crear_usuario/`,
        { email, password, nombre },
        this.httpOptions(false)
      )
    );
  }


  /** Exponer el idToken */
  get token(): string | null {
    return this.idToken;
  }

  /** Saber si hay sesión iniciada */
  get isLoggedIn(): boolean {
    return !!this.idToken;
  }
}