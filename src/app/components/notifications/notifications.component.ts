import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { Notification } from '../../models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private notificationsService = inject(NotificationsService);

  notifications = this.notificationsService.notifications;
  unreadCount = this.notificationsService.unreadCount;

  ngOnInit(): void {
    this.notificationsService.fetch();
  }

  markAsRead(n: Notification): void {
    if (!n.read) {
      this.notificationsService.markAsRead(n);
    }
  }
}
