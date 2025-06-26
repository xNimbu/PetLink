// src/app/services/auth.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private idToken: string | null = null;
  private readonly STORAGE_KEY = 'auth_token';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: Auth,
    private http: HttpClient
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.STORAGE_KEY);
      if (token) {
        this.idToken = token;
      }
    }
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

  async loginWithEmail(email: string, password: string): Promise<string> {
    const cred: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const token = await cred.user.getIdToken();
    this.persistToken(token)
    return token;
  }

  async loginWithGoogle(): Promise<string> {
    // 1️⃣ Autenticación con Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);

    // 2️⃣ Obtener y persistir el token
    const token = await result.user.getIdToken();
    this.persistToken(token);

    // 3️⃣ Construir perfil inicial
    const perfil = {
      fullName: result.user.displayName || '',
      username: result.user.email?.split('@')[0] || '',
      email: result.user.email || '',
      phone: '',
      role: '',
      photoURL: result.user.photoURL || ''
    };

    // 4️⃣ Intentar crear/actualizar perfil, pero SIN bloquear el login
    try {
      await firstValueFrom(
        this.http.post(
          `${environment.backendUrl}/profile/`,
          perfil,
          this.httpOptions(true)
        )
      );
    } catch (e) {
      console.warn('No se pudo crear el perfil automáticamente:', e);
      // Opcional: mostrar un Toastr o similar, pero NO throw
    }

    // 5️⃣ Devolver siempre el token para que el componente continúe
    return token;
  }


  logout(): void {
    this.idToken = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.auth.signOut();
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

  public getAuthHeaders(): { headers: HttpHeaders } {
    if (this.idToken) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.idToken}`
        })
      };
    } else {
      console.warn('Intentando usar auth headers sin token');
      return { headers: new HttpHeaders() };
    }
  }

  public jsonOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.idToken}`
      })
    };
  }

  public formOptions() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.idToken}`
      })
    };
  }
}