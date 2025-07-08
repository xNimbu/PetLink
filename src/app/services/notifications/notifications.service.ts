import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _notifications = signal<Notification[]>([]);
  private base = `${environment.backendUrl}/profile/notifications`;

  /** Lista de notificaciones (solo lectura) */
  readonly notifications = this._notifications.asReadonly();

  /** Número de notificaciones no leídas */
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  constructor() {
    if (typeof window !== 'undefined') {
      this.auth.ready$
        .pipe(filter(() => this.auth.isLoggedIn))
        .subscribe(() => this.fetch());
    }
  }

  /** Obtiene notificaciones del backend */
  fetch(): void {
    this.http
      .get<{ notifications: Notification[] }>(`${this.base}/`, this.auth.getAuthHeaders())
      .subscribe({
        next: res => this._notifications.set(res.notifications),
        error: err => console.error('Error fetching notifications', err)
      });
  }

  /** Marca una notificación como leída */
  markAsRead(target: Notification): void {
    if (!target.id) return;
    this.http
      .patch(`${this.base}/${target.id}/`, {}, this.auth.getAuthHeaders())
      .subscribe({
        next: () => {
          this._notifications.update(list =>
            list.map(item =>
              item.id === target.id ? { ...item, read: true } : item
            )
          );
        },
        error: err => console.error('Error marking notification as read', err)
      });
  }
}
