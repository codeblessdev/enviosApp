import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatospersonalesEnvioComponent } from './datospersonales-envio.component';

describe('DatospersonalesEnvioComponent', () => {
  let component: DatospersonalesEnvioComponent;
  let fixture: ComponentFixture<DatospersonalesEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatospersonalesEnvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatospersonalesEnvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
