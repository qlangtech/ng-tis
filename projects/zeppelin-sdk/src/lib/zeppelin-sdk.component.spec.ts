import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeppelinSdkComponent } from './zeppelin-sdk.component';

describe('ZeppelinSdkComponent', () => {
  let component: ZeppelinSdkComponent;
  let fixture: ComponentFixture<ZeppelinSdkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZeppelinSdkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZeppelinSdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
