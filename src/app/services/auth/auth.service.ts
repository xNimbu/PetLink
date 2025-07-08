// src/app/services/auth/auth.service.ts
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential
} from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';

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
  private refreshIntervalId: any;
  _currentUser = new BehaviorSubject<User | null>(null);

  /** Emite true cuando ya hay un token válido (incluso tras F5) */
  private readySubject = new BehaviorSubject<boolean>(false);
  ready$ = this.readySubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() private auth: Auth,
    private http: HttpClient
  ) {
    // 1️⃣ Carga token de localStorage si existe
    if (this.auth && isPlatformBrowser(this.platformId)) {
      // 1️⃣ Carga token de localStorage
      const token = localStorage.getItem(this.STORAGE_KEY);
      if (token) {
        this.idToken = token;
      }
      // Emitimos ready tan pronto como se recupera el token
      this.readySubject.next(true);

      // 2️⃣ Persistencia
      setPersistence(this.auth, browserLocalPersistence)
        .catch(e => console.warn('No se pudo setear persistencia:', e));

      // 3️⃣ Escucho cambios de estado
      authState(this.auth).subscribe(async user => {
        this._currentUser.next(user);

        if (user) {
          try {
            const token = await user.getIdToken();
            this.persistToken(token); // 🔐 << asegura que se guarde el token correctamente
          } catch (e) {
            console.warn('No se pudo obtener el token tras cambio de authState:', e);
          }
        }

        this.readySubject.next(true);
      });


      // 2. Cada vez que Firebase renueve el token, lo persistimos
      onIdTokenChanged(this.auth, user => {
        if (user) {
          user.getIdToken()
            .then(t => this.persistToken(t))
            .catch(e => console.warn('Error refreshing token:', e));
        }
      });
    } else {
      // SSR: marcamos listo para que no bloquee el isStable
      this.readySubject.next(true);
    }
  }

  get uid(): string | null {
    return this._currentUser.value?.uid ?? null;
  }

  async getIdToken(): Promise<string> {
    if (this.idToken) return this.idToken;

    const user = this._currentUser.value;

    if (user) {
      const token = await user.getIdToken();
      this.persistToken(token);
      return token;
    }

    const userFromState = await firstValueFrom(authState(this.auth));
    if (!userFromState) throw new Error('No hay usuario autenticado');

    const token = await userFromState.getIdToken();
    this.persistToken(token);
    return token;
  }


  private buildHeaders(includeAuth = false): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (includeAuth && this.idToken) {
      headers = headers.set('Authorization', `Bearer ${this.idToken}`);
    }
    // si includeAuth===true pero no hay token, devolvemos headers sin Authorization
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
    clearInterval(this.refreshIntervalId);
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
