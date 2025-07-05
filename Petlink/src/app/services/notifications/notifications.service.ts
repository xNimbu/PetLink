import { Injectable, computed, signal } from '@angular/core';
import { Notification } from '../../models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _notifications = signal<Notification[]>([]);

  /** Lista de notificaciones (solo lectura) */
  readonly notifications = this._notifications.asReadonly();

  /** Número de notificaciones no leídas */
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  constructor() {
    if (typeof window !== 'undefined') {
      // Simulación: añadir una notificación cada 15s
      setInterval(() => this.addFakeNotification(), 15000);
    }
  }

  /** Marca una notificación como leída */
  markAsRead(target: Notification): void {
    this._notifications.update(list =>
      list.map(item =>
        item.id === target.id ? { ...item, read: true } : item
      )
    );
  }

  private addFakeNotification(): void {
    const count = this._notifications().length + 1;
    const n: Notification = {
      id: Date.now().toString(),
      username: 'ilusm',
      avatar: '/assets/images/blacktest.jpg',
      message: `Notificación ${count}`,
      read: false
    };
    this._notifications.update(list => [n, ...list]);
  }
}
