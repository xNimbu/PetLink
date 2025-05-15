// auth-shell.component.ts
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {
  trigger, transition, style,
  query, animate, group
} from '@angular/animations';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-shell.component.html',
  styleUrls: ['./auth-shell.component.scss'],
  animations: [
    trigger('slideFade', [
      transition('LoginPage => RegisterPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
        group([
          query(':leave',
            animate('400ms ease', style({ transform: 'translateX(-100%)', opacity: 0 })),
            { optional: true }),
          query(':enter', [
            style({ transform: 'translateX(100%)', opacity: 0 }),
            animate('400ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
          ], { optional: true })
        ])
      ]),
      transition('RegisterPage => LoginPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
        group([
          query(':leave',
            animate('400ms ease', style({ transform: 'translateX(100%)', opacity: 0 })),
            { optional: true }),
          query(':enter', [
            style({ transform: 'translateX(-100%)', opacity: 0 }),
            animate('400ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AuthShellComponent {
  prepareRoute(outlet: RouterOutlet): 'LoginPage' | 'RegisterPage' {
    // Si el outlet ya está activo devuelve su data.animation,
    // si no, devolvemos 'LoginPage' para que nunca sea undefined.
    return outlet.isActivated
      ? (outlet.activatedRouteData['animation'] as 'LoginPage' | 'RegisterPage')
      : 'LoginPage';
  }
}
