import { TestBed, inject } from '@angular/core/testing';

import { KosztyTransportuService } from './koszty-transportu.service';

describe('KosztyTransportuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KosztyTransportuService]
    });
  });

  it('should be created', inject([KosztyTransportuService], (service: KosztyTransportuService) => {
    expect(service).toBeTruthy();
  }));
});
