import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  posts = [
    {
      userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      username: 'alex123',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      text: '¡Qué gran día para pasear a mi perro!'
    },
    {
      userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      username: 'maria_petlover',
      imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
      text: 'Mi gato acaba de aprender un truco nuevo.'
    }
  ];
}
