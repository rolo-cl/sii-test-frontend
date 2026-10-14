import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PokemonDetail } from '../../core/pokemon.models';
import { PokemonDetailPage } from './pokemon-detail.page';

const pikachu: PokemonDetail = {
  id: 25,
  name: 'pikachu',
  image: 'pikachu.png',
  height: 0.4,
  weight: 6,
  baseExperience: 112,
  types: ['electric'],
  abilities: [
    { name: 'static', hidden: false },
    { name: 'lightning-rod', hidden: true },
  ],
  stats: [
    { name: 'hp', value: 35 },
    { name: 'speed', value: 90 },
  ],
  genus: 'Pokémon Ratón',
  description: 'Levanta su cola para vigilar los alrededores.',
};

describe('PokemonDetailPage', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [{ path: 'pokemon/:name', component: PokemonDetailPage }],
          withComponentInputBinding(),
        ),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('loads the pokemon from the route param and renders its data', async () => {
    await harness.navigateByUrl('/pokemon/pikachu');
    http.expectOne('/api/pokemon/pikachu').flush(pikachu);
    await harness.fixture.whenStable();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toBe('Pikachu');
    expect(el.textContent).toContain('#0025');
    expect(el.textContent).toContain('Eléctrico');
    expect(el.textContent).toContain('Lightning Rod');
    expect(el.textContent).toContain('(oculta)');
    expect(el.querySelector('.total .value')?.textContent).toBe('125');
  });

  it('shows a not-found message for unknown pokemon', async () => {
    await harness.navigateByUrl('/pokemon/missingno');
    http
      .expectOne('/api/pokemon/missingno')
      .flush({ message: 'Pokémon not found' }, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.textContent).toContain(
      'No encontramos un Pokémon llamado “missingno”',
    );
  });
});
