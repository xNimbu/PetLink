import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ProfileService } from '../../services/profile/profile.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  profileForm!: FormGroup;
  loading = false;
  showPassword = false;
  showPassword2 = false;
  step = 1;
  private email = '';
  private password = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });

    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      phone: ['']
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

      // Guarda credenciales para el siguiente paso y loguea para obtener token
      this.email = email;
      this.password = password;
      await this.authService.loginWithEmail(email, password);
      this.step = 2;
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'Error al registrar';
      this.toastr.error(msg, 'Falló Registro');
    } finally {
      this.loading = false;
    }
  }

  async completeProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('fullName', this.registerForm.value.nombre);
    formData.append('email', this.email);
    formData.append('username', this.profileForm.value.username);
    formData.append('phone', this.profileForm.value.phone);
    try {
      await firstValueFrom(this.profileService.updateProfileForm(formData));
      this.toastr.success('Perfil completado', '¡Listo!');
      this.router.navigate(['/home']);
    } catch (err: any) {
      const msg = err.error?.error || err.message || 'Error al completar perfil';
      this.toastr.error(msg, 'Falló');
    } finally {
      this.loading = false;
    }
  }

  onLogin() {
    this.router.navigate(['login'], { relativeTo: this.route.parent });
  }
}
