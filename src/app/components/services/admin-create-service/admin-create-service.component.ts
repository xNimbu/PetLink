import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServicesApiService } from '../../../services/services-api/services-api.service';

@Component({
  selector: 'app-admin-create-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './admin-create-service.component.html'
})
export class AdminCreateServiceComponent {
  private api = inject(ServicesApiService);
  private fb = inject(FormBuilder);

  success = '';
  error = '';

  form = this.fb.group({
    businessEmail: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    businessName: ['', Validators.required],
    services: this.fb.array([this.fb.control('', Validators.required)]),
    contact: this.fb.group({
      phone: [''],
      email: ['', Validators.email],
      website: [''],
      social: this.fb.array([])
    })
  });

  get servicesArray() {
    return this.form.get('services') as FormArray;
  }

  get socialArray() {
    return this.form.get('contact')!.get('social') as FormArray;
  }

  addServiceField() {
    this.servicesArray.push(this.fb.control('', Validators.required));
  }

  removeServiceField(i: number) {
    this.servicesArray.removeAt(i);
  }

  addSocialField() {
    this.socialArray.push(this.fb.control(''));
  }

  removeSocialField(i: number) {
    this.socialArray.removeAt(i);
  }

  submit() {
    this.success = '';
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const payload = {
      email: value.businessEmail!,
      password: value.password!,
      businessName: value.businessName!,
      services: (value.services || []).filter(s => !!s) as string[],
      contact: {
        phone: value.contact?.phone || undefined,
        email: value.contact?.email || undefined,
        website: value.contact?.website || undefined,
        social: (value.contact?.social || []).filter(s => !!s) as string[]
      }
    };

    this.api.createServiceProfile(payload).subscribe({
      next: () => {
        this.success = 'Perfil creado correctamente';
        this.form.reset();
        this.servicesArray.clear();
        this.servicesArray.push(this.fb.control('', Validators.required));
        this.socialArray.clear();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al crear perfil';
      }
    });
  }
}
