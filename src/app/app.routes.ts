import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Explorador de Pokémon',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.page').then((m) => m.PokemonListPage),
  },
  {
    path: 'pokemon/:name',
    title: 'Detalle · Explorador de Pokémon',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail.page').then((m) => m.PokemonDetailPage),
  },
  { path: '**', redirectTo: '' },
];
