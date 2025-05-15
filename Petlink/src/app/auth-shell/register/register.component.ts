import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showPassword2 = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }

  togglePasswordVisibility(field: 'password' | 'password2') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showPassword2 = !this.showPassword2;
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { nombre, email, password, password2 } = this.registerForm.value;
    if (password !== password2) {
      this.toastr.error('Las contraseñas no coinciden', 'Error');
      return;
    }
    this.loading = true;
    try {
      await this.authService.register(email, password, nombre);
      this.toastr.success('Usuario creado correctamente', '¡Registro OK!');
      this.router.navigate(['/login']);
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'Error al registrar';
      this.toastr.error(msg, 'Falló Registro');
    } finally {
      this.loading = false;
    }
  }

  onLogin() {
    this.router.navigate(['login'], { relativeTo: this.route.parent });
  }
}
