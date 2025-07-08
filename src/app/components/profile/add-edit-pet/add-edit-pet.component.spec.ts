import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPetModalComponent } from './add-edit-pet.component';

describe('AddEditPetModalComponent', () => {
  let component: AddEditPetModalComponent;
  let fixture: ComponentFixture<AddEditPetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditPetModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditPetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
