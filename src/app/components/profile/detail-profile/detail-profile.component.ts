import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-profile.component.html',
  styleUrls: ['./detail-profile.component.scss']
})
export class DetailProfileComponent {
  @Input() user!: any;
  @Input() petPhotos: string[] = [];
  @Input() friends: any[] = [];
}
