import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearenvioComponent } from './crearenvio.component';

describe('CrearenvioComponent', () => {
  let component: CrearenvioComponent;
  let fixture: ComponentFixture<CrearenvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearenvioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearenvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
