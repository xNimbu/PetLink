import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators';
import { PostsComponent } from '../../home/posts/posts.component';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-profile-posts',
  standalone: true,
  imports: [CommonModule, PostsComponent],
  templateUrl: './profile-posts.component.html',
  styleUrls: ['./profile-posts.component.scss']
})
export class ProfilePostsComponent implements OnInit {
  uid: string | null = null;

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        first(),
        switchMap(params => {
          const uid = params.get('uid');
          const username = params.get('username');
          if (uid) {
            return of(uid);
          }
          if (username) {
            return this.profileService.getProfileByUsername(username).pipe(
              map(profile => profile.uid)
            );
          }
          return of(null);
        })
      )
      .subscribe(res => (this.uid = res));
  }
}
