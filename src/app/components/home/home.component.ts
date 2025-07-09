import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddPostComponent } from "./add-post/add-post.component";
import { PostsComponent } from "./posts/posts.component";
import { ChatsComponent } from "./chats/chats.component";
import { SuggestionsComponent } from './suggestions/suggestions.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AddPostComponent, SuggestionsComponent, PostsComponent, ChatsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {
  
}
