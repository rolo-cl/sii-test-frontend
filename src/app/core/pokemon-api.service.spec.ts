import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PokemonApiService } from './pokemon-api.service';

describe('PokemonApiService', () => {
  let service: PokemonApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokemonApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests a page from the BFF with search params', async () => {
    const result = firstValueFrom(service.list({ page: 2, pageSize: 24, search: 'pika' }));

    const req = http.expectOne((r) => r.url === '/api/pokemon');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('24');
    expect(req.request.params.get('search')).toBe('pika');
    req.flush({ count: 0, page: 2, pageSize: 24, totalPages: 1, results: [] });

    await expect(result).resolves.toMatchObject({ page: 2 });
  });

  it('omits the search param when empty', () => {
    service.list({ page: 1, pageSize: 24 }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/pokemon');
    expect(req.request.params.has('search')).toBe(false);
    req.flush({});
  });

  it('requests a detail by name', () => {
    service.getDetail('mr-mime').subscribe();
    http.expectOne('/api/pokemon/mr-mime').flush({});
  });
});
