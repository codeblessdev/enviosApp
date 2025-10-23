import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisenviosComponent } from './misenvios.component';

describe('MisenviosComponent', () => {
  let component: MisenviosComponent;
  let fixture: ComponentFixture<MisenviosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisenviosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisenviosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
