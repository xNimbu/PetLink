// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface ChatEvent {
  type: 'auth.success' | 'history' | 'chat.message';
  user: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket$: WebSocketSubject<any> | null = null;

  connect(room: string = 'prueba'): Observable<ChatEvent> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No se encontró token en localStorage under key "auth_token"');
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url      = `${protocol}://${window.location.host}/ws/chat/${room}/`;

    this.socket$ = webSocket({
      url,
      openObserver: {
        next: () => {
          // Cuando abre el socket, enviamos auth automáticamente
          if (this.socket$) {
            this.socket$.next({ type: 'auth', token });
          }
        },
      },
      closeObserver: {
        next: () => console.log('WebSocket cerrado'),
      },
    });

    return this.socket$.pipe(
      filter(msg => !!msg.type),
      map(msg => msg as ChatEvent)
    );
  }

  sendMessage(text: string) {
    if (this.socket$) {
      this.socket$.next({ message: text });
    }
  }

  disconnect() {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
}
