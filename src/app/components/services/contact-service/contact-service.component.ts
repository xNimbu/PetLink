import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServicesApiService } from '../../../services/services-api/services-api.service';
import { ServiceProfile } from '../../../models';

@Component({
  selector: 'app-contact-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './contact-service.component.html'
})
export class ContactServiceComponent {
  @Input() service!: ServiceProfile;

  form = this.fb.group({
    message: ['', Validators.required]
  });

  sending = false;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private api: ServicesApiService) {}

  submit() {
    if (this.form.invalid || !this.service) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.api.contactService(this.service.uid, this.form.value.message!).subscribe({
      next: () => {
        this.activeModal.close('sent');
      },
      error: err => {
        console.error(err);
        this.sending = false;
      }
    });
  }
}
