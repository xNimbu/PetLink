import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Notification } from '../../models';
import { NotificationsService } from '../../services/notifications/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private notificationsService = inject(NotificationsService);
  showNotifications = false;
  query = '';
  results: Array<{ uid: string; username: string; avatar: string }> = [];

  /** Lista reactiva de notificaciones */
  notifications = this.notificationsService.notifications;
  /** Contador de no leídas */
  unreadCount = this.notificationsService.unreadCount;

  constructor(
    private router: Router,
    private host: ElementRef,
    private http: HttpClient,
  ) { }

  onSearch() {
    if (!this.query.trim()) {
      this.results = [];
      return;
    }
    this.http.get<any[]>(`/api/profile_list/?q=${encodeURIComponent(this.query)}`)
      .subscribe(data => this.results = data);
  }

  openHome(): void {
    this.router.navigate(['/home']);
  }

  openSettings(): void {
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