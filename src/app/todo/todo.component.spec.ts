import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyRouteComponent } from './todo.component';

describe('LazyRouteComponent', () => {
  let component: LazyRouteComponent;
  let fixture: ComponentFixture<LazyRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LazyRouteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LazyRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
