import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  token: string | null = null;
  protectedData: any = null;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  async onLoginEmail() {
    try {
      this.token = await this.authService.loginWithEmail(this.email, this.password);
      this.toastr.success('¡Login exitoso!', 'Bienvenido');
    } catch (err: any) {
      this.toastr.error(err.message || 'Error al iniciar sesión', 'Falló Login');
    }
  }

  async onLoginGoogle() {
    try {
      this.token = await this.authService.loginWithGoogle();
      this.toastr.success('¡Login con Google exitoso!', 'Bienvenido');
    } catch (err: any) {
      this.toastr.error(err.message || 'Error en Google Auth', 'Falló Login');
    }
  }

  async onGetProtected() {
    try {
      this.protectedData = await this.authService.getProtectedData();
    } catch (err: any) {
      this.toastr.error(err.message || 'Error en Servicio', 'protegido');
    }
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
