import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const google: any;
declare const window: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    window.handleCredentialResponse = (response: any) => {
      console.log('Token JWT de Google:', response.credential);
      // Aquí puedes validar el token o enviarlo a tu backend
    };

    google.accounts.id.initialize({
      client_id: 'TU_CLIENT_ID_AQUI', // <-- Reemplaza por tu Client ID
      callback: window.handleCredentialResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("google-button"),
      { theme: "outline", size: "large" }
    );
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Email:', email);
      console.log('Password:', password);
      // Aquí haces la petición al backend o Firebase
    }
  }
}
