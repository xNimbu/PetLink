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
addPet(form: FormData): Observable<Pet> {
  // Cambia el tipo de retorno a Pet en lugar de { id }
  return this.http.post<Pet>(`${this.base}/`, form);
}

  /** Editar mascota existente */
  updatePet(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.base}/${id}/`, formData, this.auth.formOptions());
  }

  /** Eliminar mascota */
  deletePet(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}/`, this.auth.getAuthHeaders());
  }
}
