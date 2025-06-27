import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter, firstValueFrom, Subscription } from 'rxjs';
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
export class ChatsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody', { static: false }) chatBody!: ElementRef<HTMLDivElement>;


  uid = '';
  currentUsername = '';
  currentRoomId: string | null = null;
  friends: Friend[] = [];
  selectedChat: Friend | null = null;
  chatConversations: { [chatId: string]: ConversationMessage[] } = {};
  newMessageText = '';
  private msgSub?: Subscription;
  private shouldScroll = false;

  constructor(
    private authService: AuthService,
    private friendSvc: FriendService,
    private chatSvc: ChatService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // 1) Espera a que el estado de autenticación esté listo
    this.authService.ready$.pipe(filter(r => r)).subscribe(() => {
      const user = this.authService._currentUser.value;
      if (user) {
        this.uid = user.uid;
        this.currentUsername = user.displayName || user.email || user.uid;
        // 2) Carga la lista de amigos una vez tengas el username
        this.friendSvc.list().subscribe({
          next: resp => this.friends = resp.friends,
          error: err => console.error('Error cargando amigos', err)
        });
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.chatBody.nativeElement.scrollTop =
        this.chatBody.nativeElement.scrollHeight;
    }
  }

  async openChat(f: Friend) {
    // 0) Marca el seleccionado
    this.selectedChat = f;

    // 1) USA LOS UIDs para generar la sala
    //    Garantiza que ambos clientes den el mismo resultado
    const me = this.authService.uid!;
    const you = f.uid;
    const roomId = [me, you].sort().join('_');   // p.ej. "UID_A_UID_B"
    this.currentRoomId = roomId;


    // 2) Carga historial HTTP
    const token = await this.authService.getIdToken();
    const history = await firstValueFrom(this.chatSvc.fetchHistory(roomId, token));
    this.chatConversations[roomId] = history.map(h => ({
      sender: h.user === this.currentUsername ? 'me' : 'them',
      text: h.message
    }));
    this.scrollToBottom();

    // 3) Conecta WS a la **misma** sala
    this.chatSvc.disconnect();
    this.msgSub?.unsubscribe();
    this.chatSvc.connect(token, roomId);
    this.msgSub = this.chatSvc.messages$.subscribe(m => {
      if (m.history) {
        return;
      }
      const sender = m.user === this.currentUsername ? 'me' : 'them';
      this.chatConversations[this.currentRoomId!].push({
        sender,
        text: m.message!
      });
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedChat) return;
    this.chatSvc.sendMessage(this.newMessageText);
    this.newMessageText = '';
  }

  /**
   * Construye un ID de sala combinando dos usernames en orden alfabético,
   * normalizando eliminando espacios y pasando a minúsculas.
   */
  public makeChatIdByUsername(a: string, b: string): string {
    return [a, b]
      .map(u =>
        u
          .trim()
          .toLowerCase()
          // solo letras, números y '_' → quita puntos, espacios, tildes, etc.
          .replace(/[^a-z0-9_]/g, '')
      )
      .sort()
      .join('_');
  }



  public getChatIdByUsername(a: string, b: string): string {
    return this.makeChatIdByUsername(a, b);
  }

  private scrollToBottom() {
    // En vez de setTimeout, marcamos la bandera para AfterViewChecked
    this.shouldScroll = true;
  }

  closeChat() {
    this.selectedChat = null;
    this.chatSvc.disconnect();
    this.msgSub?.unsubscribe();
  }

  ngOnDestroy() {
    this.chatSvc.disconnect();
    this.msgSub?.unsubscribe();
  }
}
