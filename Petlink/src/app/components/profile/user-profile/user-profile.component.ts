import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendService } from '../../../services/friends/friend.service';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  uid!: string;
  profile: any;
  isFriend = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    // 1) Leer UID de la ruta
    this.route.paramMap.pipe(
      switchMap(params => {
        this.uid = params.get('uid')!;
        // 2) Cargar perfil desde tu endpoint /api/profile/
        return this.http.get<any>(`/api/profile/${this.uid}/`);
      })
    ).subscribe(profileData => {
      this.profile = profileData;
      // 3) Verificar si ya es amigo
      this.friendService.list().subscribe(resp => {
        this.isFriend = resp.friends.some(f => f.uid === this.uid);
      });
    });
  }

  addFriend() {
    this.friendService.add(this.uid).subscribe(() => {
      this.isFriend = true;
    });
  }
}
