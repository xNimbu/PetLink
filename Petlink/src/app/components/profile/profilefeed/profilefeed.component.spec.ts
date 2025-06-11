import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilefeedComponent } from './profilefeed.component';

describe('ProfilefeedComponent', () => {
  let component: ProfilefeedComponent;
  let fixture: ComponentFixture<ProfilefeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilefeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilefeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
