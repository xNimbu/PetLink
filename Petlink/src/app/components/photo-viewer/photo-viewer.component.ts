import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector   : 'app-photo-viewer',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './photo-viewer.component.html',
  styleUrls  : ['./photo-viewer.component.scss'],
})

export class PhotoViewerComponent  {

  @Input() photos: string[] = [];
  @Input() index = 0;

  constructor(public activeModal: NgbActiveModal) {}

  next() { if (this.photos.length) this.index = (this.index+1)%this.photos.length; }
  prev() { if (this.photos.length) this.index = (this.index-1+this.photos.length)%this.photos.length; }

  // Esc para cerrar el modal
  @HostListener('document:keydown.escape') esc() { this.activeModal.dismiss(); }

  // Navegacion con flechas del teclado
  @HostListener('document:keydown.arrowRight') kNext() { this.next(); }
  @HostListener('document:keydown.arrowLeft') kPrev() { this.prev(); }
}