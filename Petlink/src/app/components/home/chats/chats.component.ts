import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Friend, FriendService } from '../../../services/friends/friend.service';
import { ChatService } from '../../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

interface ConversationMessage {
  sender: 'me' | 'them';
  text: string;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, OnDestroy {
  uid = '';
  currentUsername = '';
  friends: Friend[] = [];
  selectedChat: Friend | null = null;
  chatConversations: { [chatId: string]: ConversationMessage[] } = {};
  newMessageText = '';
  private msgSub?: Subscription;

  constructor(
    private authService: AuthService,
    private friendSvc: FriendService,
    private chatSvc: ChatService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Cargo UID y username del usuario autenticado
    this.authService._currentUser.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        this.currentUsername = user.displayName || user.email || user.uid;
      }
    });

    // Cargo lista de amigos
    this.friendSvc.list().subscribe({
      next: resp => {
        this.friends = resp.friends;
      },
      error: err => console.error('Error cargando amigos', err)
    });
  }

  async openChat(f: Friend) {
    this.selectedChat = f;
    // Ahora usamos una mezcla de usernames para el roomId
    const roomId = this.makeChatIdByUsername(
      this.currentUsername,
      f.username
    );
    this.chatConversations[roomId] ||= [];

    console.log('[ChatsComponent] Sala de chat (por username):', roomId);

    // Cierra la conexión anterior
    this.chatSvc.ngOnDestroy();
    this.msgSub?.unsubscribe();

    let token: string;
    try {
      token = await this.authService.getIdToken();
    } catch (e) {
      console.error('No pude obtener token de Firebase:', e);
      return;
    }
    console.log('[ChatsComponent] Token de Firebase:', token);

    this.chatSvc.connect(token, roomId);
    this.msgSub = this.chatSvc.messages$.subscribe(m => {
      const sender = m.user === this.currentUsername ? 'me' : 'them';
      this.chatConversations[roomId].push({ sender, text: m.message! });
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedChat) return;
    // Generamos el mismo roomId con usernames
    const chatId = this.makeChatIdByUsername(
      this.currentUsername,
      this.selectedChat.username
    );

    this.chatSvc.sendMessage(this.newMessageText);
    this.chatConversations[chatId].push({
      sender: 'me',
      text: this.newMessageText
    });
    this.newMessageText = '';
  }

  closeChat() {
    this.selectedChat = null;
    this.chatSvc.ngOnDestroy();
    this.msgSub?.unsubscribe();
  }

  /**
   * Construye un ID de sala combinando dos usernames en orden alfabético,
   * normalizando eliminando espacios y pasando a minúsculas.
   */
  public makeChatIdByUsername(a: string, b: string): string {
    return [a, b]
      .map(u => u.trim().toLowerCase().replace(/\s+/g, ''))
      .sort()
      .join('_');
  }

  public getChatIdByUsername(a: string, b: string): string {
    return this.makeChatIdByUsername(a, b);
  }

  ngOnDestroy() {
    this.chatSvc.ngOnDestroy();
    this.msgSub?.unsubscribe();
  }
}
