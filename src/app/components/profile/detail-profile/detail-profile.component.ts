import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhotoViewerComponent } from '../../../../../Petlink/src/app/components/photo-viewer/photo-viewer.component';


@Component({
  selector   : 'app-detail-profile',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './detail-profile.component.html',
  styleUrls  : ['./detail-profile.component.scss']
})
export class DetailProfileComponent {

  @Input() user!: any;
  @Input() petPhotos: string[] = [];
  @Input() friends   : any[]   = [];

  constructor(private modal: NgbModal) {}                              

  /* Abre el visor de fotos */
  openViewer(startIndex: number) {                               
    const ref = this.modal.open(PhotoViewerComponent, {
      centered : true,
      size     : 'xl',
      backdrop : 'static',
      keyboard : false
    });
    ref.componentInstance.photos = this.petPhotos;
    ref.componentInstance.index  = startIndex;
  }                                                                   
}
