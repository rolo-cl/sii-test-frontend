import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PokemonPage } from '../../core/pokemon.models';
import { PAGE_SIZE, PokemonListPage } from './pokemon-list.page';

const page = (overrides: Partial<PokemonPage> = {}): PokemonPage => ({
  count: 2,
  page: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  results: [
    { id: 25, name: 'pikachu', image: 'pikachu.png' },
    { id: 26, name: 'raichu', image: 'raichu.png' },
  ],
  ...overrides,
});

describe('PokemonListPage', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: PokemonListPage }]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  async function render(url: string, response: PokemonPage) {
    await harness.navigateByUrl(url);
    http.expectOne((r) => r.url === '/api/pokemon').flush(response);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  }

  it('reads search and page from the URL and renders the results', async () => {
    await harness.navigateByUrl('/?q=chu&page=2');
    const req = http.expectOne((r) => r.url === '/api/pokemon');
    expect(req.request.params.get('search')).toBe('chu');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(page({ page: 2, totalPages: 2 }));
    await harness.fixture.whenStable();

    const el = harness.routeNativeElement as HTMLElement;
    const names = [...el.querySelectorAll('.name')].map((n) => n.textContent?.trim());
    expect(names).toEqual(['Pikachu', 'Raichu']);
    expect(el.querySelector('.pagination')?.textContent).toContain('Página 2 de 2');
    expect(el.querySelector<HTMLInputElement>('input')?.value).toBe('chu');
  });

  it('shows an empty state when nothing matches', async () => {
    const el = await render('/?q=zzz', page({ count: 0, results: [] }));
    expect(el.textContent).toContain('No encontramos Pokémon cuyo nombre contenga “zzz”');
  });

  it('shows an error with retry when the BFF fails', async () => {
    await harness.navigateByUrl('/');
    http
      .expectOne((r) => r.url === '/api/pokemon')
      .flush('boom', { status: 502, statusText: 'Bad Gateway' });
    await harness.fixture.whenStable();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('No pudimos cargar el catálogo');

    el.querySelector<HTMLButtonElement>('.message button')?.click();
    http.expectOne((r) => r.url === '/api/pokemon').flush(page());
    await harness.fixture.whenStable();
    expect(el.querySelectorAll('app-pokemon-card').length).toBe(2);
  });
});
