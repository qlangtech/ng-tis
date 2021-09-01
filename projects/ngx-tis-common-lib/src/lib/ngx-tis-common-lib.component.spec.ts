import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxTisCommonLibComponent } from './ngx-tis-common-lib.component';

describe('NgxTisCommonLibComponent', () => {
  let component: NgxTisCommonLibComponent;
  let fixture: ComponentFixture<NgxTisCommonLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxTisCommonLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxTisCommonLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
