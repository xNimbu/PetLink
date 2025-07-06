import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { FriendService } from '../../services/friends/friend.service';

interface Notification {
  username: string;
  avatar: string;
  message: string;
  link?: string;
  read: boolean;
}

// Tipo para resultados de búsqueda, con flag opcional para indicar si es amigo
interface UserResult {
  uid: string;
  username: string;
  avatar: string;
  isFriend?: boolean; // Indica si es amigo
  requestSent?: boolean; // Indica si se ha enviado una solicitud de amistad

}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  // Buscador
  query = '';
  results: {
    isFriend: any;
    requestSent: any; uid: string; username: string; avatar: string
  }[] = [];
  showDropdown = false;

  // Notificaciones
  showNotifications = false;
  //query = '';
  //results: Array<{ uid: string; username: string; avatar: string }> = [];

  notifications: Notification[] = [
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'le ha dado like a tu publicación', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'ha compartido una foto tuya', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'ha comentado tu foto', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'le ha dado like a tu publicación', read: false }
  ];
  private myFriends: Set<string> = new Set(); // Para almacenar amigos

  constructor(
    private router: Router,
    private host: ElementRef,
    private http: HttpClient,
    private friendService: FriendService
  ) {
    /* ① cargar amigos una sola vez */
    this.friendService.list().subscribe(resp => {
      resp.friends.forEach(f => this.myFriends.add(f.uid));
    });
  }

  // Busqueda
  openDropdown() {
    console.log('focus en buscador');
    this.showDropdown = true;
    if (this.query.trim()) this.onSearch();
  }

  onSearch(): void {
    const q = this.query.trim();
    if (q.length < 2) {
      this.results = [];
      return;
    }

    this.http.get<UserResult[]>(`${environment.backendUrl}/profile_list/?q=${encodeURIComponent(q)}`)
      .subscribe(res => {
        console.log('resultados', res);
        this.results = res.map(u => ({ ...u, isFriend: this.myFriends.has(u.uid), requestSent: false })); // Añadir requestSent por defecto
      });
  }

  // Cerrar dropdown
  closeDropdown() {
    this.showDropdown = false;
  }

  // Enviar solicitud de amistad
  addFriend(u: UserResult, ev: MouseEvent) {
    ev.stopPropagation(); // evita navegar
    if (u.requestSent) return; // Si ya se ha enviado, no hacer nada

    this.friendService.add(u.uid).subscribe({
      next: () => u.requestSent = true, // Marcar como solicitud enviada
      error: () => alert('Error al enviar solicitud de amistad')
    });
  }

  // Ir al perfil del usuario seleccionado
  goToProfile(u: { uid: string; }): void {
    this.closeDropdown();
    this.query = '';
    this.router.navigate(['/profilefeed', u.uid]); // Ajustar ruta si es distinta
  }

  // Click fuera para cerrar el dropdown
  @HostListener('document:click', ['$event.target'])
  onDocClick(target: HTMLElement) {
    if (!this.host.nativeElement.contains(target)) {
      this.closeDropdown();
      this.showNotifications = false; // Cerrar notificaciones si se hace click fuera
    }
  }

  openHome(): void {
    this.router.navigate(['/home']);
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  toggleNotifications(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  /**
   * Marca una notificación como leída y actualiza el contador
   */
  markAsRead(notification: Notification, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!notification.read) {
      notification.read = true;
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (!this.host.nativeElement.contains(target)) {
      this.showNotifications = false;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}