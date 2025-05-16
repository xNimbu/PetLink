import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent {
  /** Recibes el usuario desde el padre, o bien podrías inyectar un AuthService */
  @Input() user: { photoURL: string; fullName: string } = {
    photoURL: '/assets/images/luis.png',
    fullName: 'xNimbu'
  };

  showForm = false;
  postContent = '';

  /** Muestra el formulario */
  openForm() {
    this.showForm = true;
  }

  /** Cierra y resetea */
  cancel() {
    this.showForm = false;
    this.postContent = '';
  }

  /** Aquí llamarías a tu servicio para crear el post */
  submitPost() {
    // ej: this.postService.create({ text: this.postContent, author: this.user }).subscribe(...)
    console.log('Publicar:', this.postContent, 'por', this.user.fullName);
    this.cancel();
  }
}
