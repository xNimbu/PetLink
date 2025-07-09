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
        next: res => {
          const withLinks = res.notifications.map(n => ({
            ...n,
            link: n.link ?? this.guessLink(n)
          }));
          this._notifications.set(withLinks);
        },
        error: err => console.error('Error fetching notifications', err)
      });
  }

  /**
   * Genera un enlace de navegación basado en el mensaje de la notificación
   */
  private guessLink(n: Notification): string | undefined {
    const msg = n.message.toLowerCase();
    if (msg.includes('agreg') && msg.includes('amig')) {
      // intenta usar el username proporcionado o inferirlo del mensaje
      const username = n.username || n.message.split(' ')[0];
      return username ? `/profile/${username}` : undefined;
    }
    if (msg.includes('coment')) {
      // para comentarios asumimos que el backend provee el enlace del post
      return n.link;
    }
    return n.link;
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
