import { TestBed } from '@angular/core/testing';

import { MaterialTableServicesService } from './material-table-services.service';

describe('MaterialTableServicesService', () => {
  let service: MaterialTableServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialTableServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
