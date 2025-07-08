import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Pet } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private base = `${environment.backendUrl}/profile/pets`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /** Listar mascotas del usuario */
  listPets(): Observable<{ pets: Pet[] }> {
    return this.http.get<{ pets: Pet[] }>(`${this.base}/`, this.auth.getAuthHeaders());
  }

  /** Agregar nueva mascota */
  addPet(data: any): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.base}/`, data, this.auth.jsonOptions());
  }

  /** Editar mascota existente */
  updatePet(id: string, data: any): Observable<any> {
    return this.http.put(`${this.base}/${id}/`, data, this.auth.jsonOptions());
  }

  /** Eliminar mascota */
  deletePet(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}/`, this.auth.getAuthHeaders());
  }
}
