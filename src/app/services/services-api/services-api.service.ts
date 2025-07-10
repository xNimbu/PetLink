import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ServiceProfile } from '../../models';

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private baseUrl = environment.backendUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** Crea un nuevo perfil de servicio (solo admin) */
  createServiceProfile(data: {
    email: string;
    password: string;
    businessName: string;
    services: string[];
    contact: {
      phone?: string;
      email?: string;
      website?: string;
      social?: string[];
    };
  }): Observable<ServiceProfile> {
    const url = `${this.baseUrl}/api/admin/create_service_profile/`;
    return this.http.post<ServiceProfile>(url, data, this.auth.jsonOptions());
  }

  /** Lista perfiles de servicio p\u00fablicos */
  listServices(q?: string): Observable<ServiceProfile[]> {
    let url = `${this.baseUrl}/api/services_list/`;
    if (q) {
      url += `?q=${encodeURIComponent(q)}`;
    }
    return this.http.get<ServiceProfile[]>(url);
  }

  /** Env\u00eda un mensaje a un servicio */
  contactService(serviceUid: string, message: string): Observable<any> {
    const url = `${this.baseUrl}/api/contact_service/`;
    return this.http.post(url, { serviceUid, message }, this.auth.jsonOptions());
  }
}
