import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Notification {
  username: string;
  avatar: string;
  message: string;
  link?: string;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showNotifications = false;

  notifications: Notification[] = [
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'le ha dado like a tu publicación', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'ha compartido una foto tuya', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'ha comentado tu foto', read: false },
    { username: 'ilusm', avatar: '/assets/images/blacktest.jpg', message: 'le ha dado like a tu publicación', read: false }
  ];

  constructor(
    private router: Router,
    private host: ElementRef
  ) {}

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