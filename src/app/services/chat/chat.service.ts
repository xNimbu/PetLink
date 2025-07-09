// src/app/services/chat/chat.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  user: string;
  message: string;
  history?: boolean;
}

export interface RawChatMessage {
  user: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket: WebSocket | null = null;
  private messagesSub = new Subject<ChatMessage>();
  readonly messages$: Observable<ChatMessage> = this.messagesSub.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Trae el historial de chat vía HTTP
   */
  fetchHistory(room: string, token: string): Observable<RawChatMessage[]> {
    const url = `${environment.backendUrl}/chat/${room}/`;
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<RawChatMessage[]>(url, { headers });
  }

  /**
   * Abre la conexión WebSocket al backend, con token en query string
   */
  connect(token: string, room: string) {
    const url = `${environment.wsUrl}${room}/?token=${encodeURIComponent(token)}/`;
    console.log('[ChatService] Conectando a', url);

    // Cierra cualquier conexión previa
    if (this.socket) this.disconnect();

    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      console.log('[ChatService] WebSocket abierto y autenticado en handshake');
    });

    this.socket.addEventListener('message', ({ data }) => {
      let d: any;
      try {
        d = JSON.parse(data);
      } catch {
        return;
      }
      // Emitimos tanto historial como mensajes en vivo
      if (d.type === 'history' || d.type === 'chat.message') {
        this.messagesSub.next({
          user: d.user,
          message: d.message,
          history: d.type === 'history'
        });
      }
    });

    this.socket.addEventListener('error', err => {
      console.error('[ChatService] WS error', err);
    });

    this.socket.addEventListener('close', () => {
      console.log('[ChatService] WS cerrado');
      this.socket = null;
    });
  }

  /**
   * Envía un mensaje al servidor via WS
   */
  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    }
  }

  /**
   * Cierra la conexión WebSocket
   */
  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
    this.messagesSub.complete();
  }
}
