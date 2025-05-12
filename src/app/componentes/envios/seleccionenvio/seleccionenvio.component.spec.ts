import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionenvioComponent } from './seleccionenvio.component';

describe('SeleccionenvioComponent', () => {
  let component: SeleccionenvioComponent;
  let fixture: ComponentFixture<SeleccionenvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionenvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeleccionenvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
