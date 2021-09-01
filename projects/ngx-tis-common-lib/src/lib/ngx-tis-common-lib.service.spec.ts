import { TestBed } from '@angular/core/testing';

import { NgxTisCommonLibService } from './ngx-tis-common-lib.service';

describe('NgxTisCommonLibService', () => {
  let service: NgxTisCommonLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxTisCommonLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
