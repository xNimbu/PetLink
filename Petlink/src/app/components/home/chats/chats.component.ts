// src/app/chats/chats.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  messages: Message[] = [
    { username: 'ilusm',  avatar: '/assets/images/blacktest.jpg',  unreadCount: 2 },
    { username: 'juanito',avatar: '/assets/images/blacktest.jpg',unreadCount: 1 },
    { username: 'maría',  avatar: '/assets/images/blacktest.jpg',  unreadCount: 3 },
    { username: 'carlos', avatar: '/assets/images/blacktest.jpg', unreadCount: 0 },
    { username: 'ana',    avatar: '/assets/images/blacktest.jpg',    unreadCount: 5 },
  ];

  selectedChat: Message | null = null;
  newMessageText = '';

  chatConversations: {
    [username: string]: Array<{ sender: 'me' | 'them'; text: string }>;
  } = {};

  ngOnInit(): void {
    this.messages.forEach(m => {
      this.chatConversations[m.username] = [];
    });
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
    if (!this.showChat) {
      this.closeChat();
    }
  }

  openChat(user: Message): void {
    this.selectedChat = user;
  }

  closeChat(): void {
    this.selectedChat = null;
    this.newMessageText = '';
  }

  sendMessage(): void {
    if (!this.selectedChat || !this.newMessageText.trim()) return;

    // push user message
    this.chatConversations[this.selectedChat.username].push({
      sender: 'me',
      text: this.newMessageText.trim()
    });

    this.newMessageText = '';

    // simulate reply
    setTimeout(() => {
      if (!this.selectedChat) return;
      this.chatConversations[this.selectedChat.username].push({
        sender: 'them',
        text: '¡Recibido! 😊'
      });
    }, 1000);
  }
}
