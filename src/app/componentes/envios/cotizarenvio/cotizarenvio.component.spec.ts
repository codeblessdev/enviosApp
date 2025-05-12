import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizarenvioComponent } from './cotizarenvio.component';

describe('CotizarenvioComponent', () => {
  let component: CotizarenvioComponent;
  let fixture: ComponentFixture<CotizarenvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotizarenvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CotizarenvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
