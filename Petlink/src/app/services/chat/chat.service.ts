// src/app/services/chat.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  user: string;
  message: string;
  history?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket: WebSocket | null = null;
  private messagesSub = new Subject<ChatMessage>();
  readonly messages$: Observable<ChatMessage> = this.messagesSub.asObservable();

  connect(token: string, room: string) {
    // El wsUrl ya incluye protocolo y path /ws/chat/
    const url = `${environment.wsUrl}${room}/`;
    console.log('[ChatService] Conectando a', url);

    if (this.socket) this.socket.close();
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      console.log('[ChatService] OPEN → enviando auth');
      this.socket!.send(JSON.stringify({ type: 'auth', token }));
    });

    this.socket.addEventListener('message', ({ data }) => {
      let d: any;
      try { d = JSON.parse(data); }
      catch { return; }
      // Solo nos interesan historial y mensajes live
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

  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    }
  }

  ngOnDestroy() {
    if (this.socket) this.socket.close();
  }
}
