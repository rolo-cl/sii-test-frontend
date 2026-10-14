import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="container">
        <a routerLink="/" class="brand">
          <span class="logo" aria-hidden="true"></span>
          Explorador de Pokémon
        </a>
      </div>
    </header>
    <main class="container">
      <router-outlet />
    </main>
    <footer class="app-footer container">
      Datos obtenidos de <a href="https://pokeapi.co" target="_blank" rel="noopener">PokéAPI</a>
      a través del BFF.
    </footer>
  `,
})
export class App {}
