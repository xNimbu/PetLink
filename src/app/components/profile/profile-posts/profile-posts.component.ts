import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { first, switchMap } from 'rxjs/operators';
import { PostsComponent } from '../../home/posts/posts.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { Post } from '../../../models';
import { Profile } from '../../../models/profile/profile.model';

@Component({
  selector: 'app-profile-posts',
  standalone: true,
  imports: [CommonModule, PostsComponent],
  templateUrl: './profile-posts.component.html',
  styleUrls: ['./profile-posts.component.scss']
})
export class ProfilePostsComponent implements OnInit {
  uid: string | null = null;
  posts: Post[] = [];
  owner: Profile | null = null;

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        first(),
        switchMap(params => {
          const username = params.get('username');
          const uidParam = params.get('uid');
          if (username) {
            return this.profileService.getProfileByUsername(username);
          }
          if (uidParam) {
            return this.profileService.getPublicProfile(uidParam);
          }
          return this.profileService.getProfile();
        })
      )
      .subscribe(profile => {
        this.uid = profile.uid;
        this.owner = profile;
        this.posts = profile.posts ?? [];
      });
  }
}
