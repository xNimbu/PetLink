import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = enviroment.apiURL; // Cambia esto por tu URL real

  constructor(private http: HttpClient) {}

  // Método para registrar un usuario
  register(userData: { email: string; password: string; nombre: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear_usuario`, userData);
  }

  // Puedes tener login aquí también si quieres
  login(email: string, password: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/protegido`, { params: { email, password } });
  }
}