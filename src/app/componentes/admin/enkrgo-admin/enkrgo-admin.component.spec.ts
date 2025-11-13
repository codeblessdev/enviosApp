import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnkrgoAdminComponent } from './enkrgo-admin.component';

describe('EnkrgoAdminComponent', () => {
  let component: EnkrgoAdminComponent;
  let fixture: ComponentFixture<EnkrgoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnkrgoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnkrgoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

