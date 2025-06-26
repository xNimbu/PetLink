// src/app/chats/chats.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatEvent, ChatService } from '../../../services/chat/chat.service';
import { Subscription } from 'rxjs';
import { Friend, FriendService } from '../../../services/friends/friend.service';

interface Message {
  username: string;
  avatar: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {
  showChat = true;
  messages: Friend[] = [];
  selectedChat: Friend | null = null;
  newMessageText = '';
  chatConversations: Record<string, Array<{ sender: 'me' | 'them'; text: string }>> = {};
  private socketSub?: Subscription;
  private friendsSub?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private friendService: FriendService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.friendsSub = this.friendService.list().subscribe({
        next: resp => {
          // 1) Rellena la lista de amigos
          this.messages = resp.friends;
          // 2) Inicializa un array vacío de mensajes para cada amigo
          this.messages.forEach(f => {
            this.chatConversations[f.uid] = [];
          });
        },
        error: err => console.error('Error cargando amigos', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.friendsSub?.unsubscribe();
    this.socketSub?.unsubscribe();
    this.chatService.disconnect();
  }

  openChat(friend: Friend): void {
    this.selectedChat = friend;
    this.socketSub?.unsubscribe();
    this.chatService.disconnect();

    // Asegúrate de que existe el array
    if (!this.chatConversations[friend.uid]) {
      this.chatConversations[friend.uid] = [];
    }

    // Conéctate a la sala usando el uid del amigo
    this.socketSub = this.chatService.connect(friend.uid)
      .subscribe({
        next: evt => this.handleEvent(evt, friend.uid),
        error: err => console.error(err)
      });
  }

  closeChat(): void {
    this.selectedChat = null;
    this.newMessageText = '';
    this.socketSub?.unsubscribe();
    this.chatService.disconnect();
  }

  sendMessage(): void {
    if (!this.selectedChat || !this.newMessageText.trim()) return;

    // Envía al canal
    this.chatService.sendMessage(this.newMessageText.trim());

    // Guarda localmente
    this.chatConversations[this.selectedChat.uid].push({
      sender: 'me',
      text: this.newMessageText.trim()
    });
    this.newMessageText = '';
  }

  private handleEvent(evt: ChatEvent, room: string) {
    if (evt.type === 'auth.success') {
      return;
    }
    // history o chat.message
    this.chatConversations[room].push({
      sender: evt.type === 'history' ? 'them'
        : (evt.user === 'me' ? 'me' : 'them'),
      text: evt.message
    });
  }
}
