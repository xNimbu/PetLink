import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  @Input() userData: any;
  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      phone: [''],
      role: [''],
    });
  }

  ngOnInit() {
    if (this.userData) {
      this.form.patchValue(this.userData);
    }
  }

  save() {
    console.log('Datos editados:', this.form.value);
    this.activeModal.close(this.form.value);
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }

}
