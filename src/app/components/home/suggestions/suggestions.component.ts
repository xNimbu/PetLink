import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FriendService } from '../../../services/friends/friend.service';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

interface UserSuggestion {
  uid: string;
  username: string;
  avatar: string;
  requestSent?: boolean;
}

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent implements OnInit {
  suggestions: UserSuggestion[] = [];

  private http = inject(HttpClient);
  private friendService = inject(FriendService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Obtener lista de perfiles y filtrar los que ya son amigos
    this.friendService.list().subscribe({
      next: resp => {
        const friendIds = new Set(resp.friends.map(f => f.uid));
        this.http.get<UserSuggestion[]>(`${environment.backendUrl}/profile_list/`)
          .subscribe(list => {
            this.suggestions = list
              .filter(u => !friendIds.has(u.uid) && u.uid !== this.authService.uid)
              .slice(0, 5)
              .map(u => ({ ...u, requestSent: false }));
          });
      },
      error: () => {
        // Si falla la carga de amigos, aun así intentar sugerencias
        this.http.get<UserSuggestion[]>(`${environment.backendUrl}/profile_list/`)
          .subscribe(list => {
            this.suggestions = list
              .filter(u => u.uid !== this.authService.uid)
              .slice(0, 5)
              .map(u => ({ ...u, requestSent: false }));
          });
      }
    });
  }

  addFriend(u: UserSuggestion): void {
    if (u.requestSent) return;
    this.friendService.add(u.uid).subscribe({
      next: () => u.requestSent = true,
      error: () => alert('Error al enviar solicitud')
    });
  }
}
