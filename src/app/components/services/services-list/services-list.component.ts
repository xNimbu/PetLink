import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServicesApiService } from '../../../services/services-api/services-api.service';
import { ServiceProfile } from '../../../models';
import { ContactServiceComponent } from '../contact-service/contact-service.component';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  private api = inject(ServicesApiService);
  private fb = inject(FormBuilder);
  private modal = inject(NgbModal);
  private auth = inject(AuthService);

  searchForm = this.fb.group({ q: [''] });
  services: ServiceProfile[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const q = this.searchForm.value.q || undefined;
    this.api.listServices(q).subscribe({
      next: list => {
        this.services = list;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Error al cargar servicios';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.load();
  }

  openContact(service: ServiceProfile): void {
    if (!this.auth.isLoggedIn) return;
    const modalRef = this.modal.open(ContactServiceComponent);
    modalRef.componentInstance.service = service;
  }
}
