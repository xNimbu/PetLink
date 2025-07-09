import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading/loading.service';
import { delay, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Petlink';
  showNavbar = true;
  loading$ = inject(LoadingService)
               .loading$
               .pipe(delay(0));
  private router = inject(Router)

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        setTimeout(() => {
          this.showNavbar =
            e.urlAfterRedirects !== '/login' &&
            e.urlAfterRedirects !== '/register';
        });
      });
  }
}
