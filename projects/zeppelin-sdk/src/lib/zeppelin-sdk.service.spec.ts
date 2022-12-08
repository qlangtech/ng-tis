import { TestBed } from '@angular/core/testing';

import { ZeppelinSdkService } from './zeppelin-sdk.service';

describe('ZeppelinSdkService', () => {
  let service: ZeppelinSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZeppelinSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
