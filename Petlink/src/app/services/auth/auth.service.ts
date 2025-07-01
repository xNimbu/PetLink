// src/app/services/auth/auth.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Auth,
  authState,
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential
} from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface GoogleLoginResponse {
  token: string;
  profile: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    photoURL: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private idToken: string | null = null;
  private readonly STORAGE_KEY = 'auth_token';
  _currentUser = new BehaviorSubject<User | null>(null);

  /** Emite true cuando ya hay un token válido (incluso tras F5) */
  private readySubject = new BehaviorSubject<boolean>(false);
  ready$ = this.readySubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: Auth,
    private http: HttpClient
  ) {
    // 1️⃣ Carga token de localStorage si existe
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.STORAGE_KEY);
      if (token) {
        this.idToken = token;
      }
    }
    setPersistence(this.auth, browserLocalPersistence)
    .catch(e => console.warn('No se pudo setear persistencia:', e));
    authState(this.auth).subscribe(user => {
      this._currentUser.next(user);
      this.readySubject.next(true);
    });
  }

  get uid(): string | null {
    return this._currentUser.value?.uid ?? null;
  }

  async getIdToken(): Promise<string> {
    if (this.idToken) return this.idToken;
    const user = await firstValueFrom(authState(this.auth));
    if (!user) throw new Error('No hay usuario autenticado');
    const token = await user.getIdToken();
    this.persistToken(token);
    return token;
  }

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

  private persistToken(token: string) {
    this.idToken = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, token);
    }
  }

  /** Login con email/password */
  async loginWithEmail(email: string, password: string): Promise<string> {
    const cred: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const token = await cred.user.getIdToken();
    this.persistToken(token);
    return token;
  }

  /**
   * Login con Google:
   * - Autentica en Firebase
   * - Obtiene ID Token
   * - Llama a /login_google/ enviando perfil inicial
   * - Devuelve solo token y perfil mínimo
   */
  async loginWithGoogle(): Promise<GoogleLoginResponse> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);

    const token = await result.user.getIdToken();
    this.persistToken(token);

    const profile = {
      fullName: result.user.displayName || '',
      username: result.user.email?.split('@')[0] || '',
      email: result.user.email || '',
      phone: '',
      role: 'user',
      photoURL: result.user.photoURL || ''
    };

    const url = `${environment.backendUrl}/login_google/`;
    await firstValueFrom(
      this.http.post(
        url,
        profile,
        this.httpOptions(true)
      )
    );

    return { token, profile };
  }

  /** Cierra sesión */
  logout(): void {
    this.idToken = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.auth.signOut();
  }

  /** Ejemplo de llamada a un endpoint protegido */
  async getProtectedData(): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(
        `${environment.backendUrl}/protegido/`,
        this.httpOptions(true)
      )
    );
  }

  /** Registrar nuevo usuario */
  register(email: string, password: string, nombre: string): Promise<{ uid: string }> {
    return firstValueFrom(
      this.http.post<{ uid: string }>(
        `${environment.backendUrl}/crear_usuario/`,
        { email, password, nombre },
        this.httpOptions(false)
      )
    );
  }

  /** Exponer el token en caso de necesidad */
  get token(): string | null {
    return this.idToken;
  }

  /** Saber si hay sesión */
  get isLoggedIn(): boolean {
    return !!this.idToken;
  }

  /**
   * Cabeceras de autenticación genéricas:
   * { headers: HttpHeaders }
   */
  public getAuthHeaders(): { headers: HttpHeaders } {
    const headers = this.buildHeaders(true);
    return { headers };
  }

  /** Para peticiones JSON (Content-Type + Auth) */
  public jsonOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.idToken}`
      })
    };
  }

  /** Para peticiones form-data (Auth) */
  public formOptions() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.idToken}`
      })
    };
  }
}
