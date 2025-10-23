import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercagopagoComponent } from './mercagopago.component';

describe('MercagopagoComponent', () => {
  let component: MercagopagoComponent;
  let fixture: ComponentFixture<MercagopagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercagopagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MercagopagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
