import { Component, Inject } from '@angular/core';
import { Route, Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private route: Router) { }
  openHome() {
    this.route.navigate(['/home']);
  }

  openProfile() {
    this.route.navigate(['/profile']);
  }
}
