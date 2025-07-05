import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FriendService } from '../../../services/friends/friend.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { AuthService } from '../../../services/auth/auth.service';

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
  isOwnProfile = false;

  constructor(
    private route: ActivatedRoute,
    private friendService: FriendService,
    private profileService: ProfileService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const username = params.get('username');
        const uidParam = params.get('uid');
        if (username) {
          return this.profileService.getProfileByUsername(username);
        }
        if (uidParam) {
          this.uid = uidParam;
          return this.profileService.getPublicProfile(uidParam);
        }
        throw new Error('No user specified');
      })
    ).subscribe(profileData => {
      this.profile = profileData;
      this.uid = profileData.uid || this.uid;
      this.isOwnProfile = this.authService.uid === this.uid;
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

  removeFriend() {
    this.friendService.remove(this.uid).subscribe(() => {
      this.isFriend = false;
    });
  }
}
