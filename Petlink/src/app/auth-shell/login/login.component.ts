import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() registerClick = new EventEmitter<void>();

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLoginEmail() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loading = true;
    try {
      await this.authService.loginWithEmail(email, password);
      this.toastr.success('¡Login exitoso!', 'Bienvenido');
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.toastr.error(err.message || 'Error al iniciar sesión', 'Falló Login');
    } finally {
      this.loading = false;
    }
  }

  onRegister() {
    this.router.navigate(['register'], { relativeTo: this.route.parent });
  }

  async onLoginGoogle() {
    this.loading = true;
    try {
      await this.authService.loginWithGoogle();
      this.toastr.success('¡Login con Google exitoso!', 'Bienvenido');
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.toastr.error(err.message || 'Error en Google Auth', 'Falló Login');
    } finally {
      this.loading = false;
    }
  }
}
