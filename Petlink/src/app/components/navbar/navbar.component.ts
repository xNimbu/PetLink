import { Component, HostListener, ElementRef, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { FriendService } from '../../services/friends/friend.service';

import { Notification } from '../../models';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { ProfileService } from '../../services/profile/profile.service';
import { AuthService } from '../../services/auth/auth.service';

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


  private notificationsService = inject(NotificationsService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  showNotifications = false;


  // Buscador
  query = '';
  results: {
    isFriend: any;
    requestSent: any; uid: string; username: string; avatar: string
  }[] = [];
  showDropdown = false;

  /** Lista reactiva de notificaciones */
  notifications = this.notificationsService.notifications;
  /** Contador de no leídas */
  unreadCount = this.notificationsService.unreadCount;

  constructor(
    private router: Router,
    private host: ElementRef,
    private http: HttpClient,
    private friendService: FriendService
  ) {
    /* ① cargar amigos una sola vez solo si hay sesión en el navegador */
    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn) {
      this.friendService.list().subscribe({
        next: resp => resp.friends.forEach(f => this.friendService.add(f.uid)),
        error: () => {
          // Avoid console noise when not authorized
        }
      });
    }
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
        this.results = res.map(u => ({ ...u, isFriend: this.friendService.has(u.uid), requestSent: false })); // Añadir requestSent por defecto
      });

    // Listar perfiles
    
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

  openSettings(): void {
    this.router.navigate(['/settings']);
  }

  openProfile(): void {
    this.profileService.getProfile()
      .then(profile => {
        const target = profile.username || profile.uid;
        this.router.navigate(['/profile', target]);
      })
      .catch(() => {
        const uid = this.authService.uid;
        if (uid) {
          this.router.navigate(['/profile', uid]);
        }
      });
  }

  toggleNotifications(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationsService.fetch();
    }
  }

  /**
   * Marca una notificación como leída y actualiza el contador
   */
  markAsRead(notification: Notification, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!notification.read) {
      this.notificationsService.markAsRead(notification);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (!this.host.nativeElement.contains(target)) {
      this.showNotifications = false;
    }
  }
}