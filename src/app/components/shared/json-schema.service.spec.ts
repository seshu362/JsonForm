import { TestBed } from '@angular/core/testing';

import { JsonSchemaService } from './json-schema.service';

describe('JsonSchemaService', () => {
  let service: JsonSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonSchemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
