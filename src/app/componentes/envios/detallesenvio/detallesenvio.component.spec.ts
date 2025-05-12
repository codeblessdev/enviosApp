import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesenvioComponent } from './detallesenvio.component';

describe('DetallesenvioComponent', () => {
  let component: DetallesenvioComponent;
  let fixture: ComponentFixture<DetallesenvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesenvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetallesenvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
