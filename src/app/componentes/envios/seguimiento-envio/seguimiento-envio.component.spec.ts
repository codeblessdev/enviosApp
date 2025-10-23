import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoEnvioComponent } from './seguimiento-envio.component';

describe('SeguimientoEnvioComponent', () => {
  let component: SeguimientoEnvioComponent;
  let fixture: ComponentFixture<SeguimientoEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoEnvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeguimientoEnvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
