import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonSummary } from '../core/pokemon.models';
import { DexNumberPipe, HumanizePipe } from './pokemon-format';

@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink, DexNumberPipe, HumanizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card" [routerLink]="['/pokemon', pokemon().name]" [state]="{ fromList: true }">
      <div class="art">
        @if (!imageFailed()) {
          <img
            [src]="pokemon().image"
            [alt]="pokemon().name | humanize"
            loading="lazy"
            width="160"
            height="160"
            (error)="imageFailed.set(true)"
          />
        } @else {
          <span class="no-image" aria-hidden="true">?</span>
        }
      </div>
      <span class="number">{{ pokemon().id | dexNumber }}</span>
      <span class="name">{{ pokemon().name | humanize }}</span>
    </a>
  `,
  styleUrl: './pokemon-card.scss',
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonSummary>();
  protected readonly imageFailed = signal(false);
}
