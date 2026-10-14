import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, combineLatest, startWith, switchMap } from 'rxjs';
import { LoadState, toLoadState } from '../../core/load-state';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { PokemonDetail } from '../../core/pokemon.models';
import { DexNumberPipe, HumanizePipe, StatLabelPipe } from '../../shared/pokemon-format';
import { TypeBadge } from '../../shared/type-badge';

/** Estadística base máxima posible en los juegos; se usa para escalar las barras. */
const MAX_BASE_STAT = 255;

@Component({
  selector: 'app-pokemon-detail-page',
  imports: [RouterLink, DexNumberPipe, HumanizePipe, StatLabelPipe, TypeBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-detail.page.html',
  styleUrl: './pokemon-detail.page.scss',
})
export class PokemonDetailPage {
  private readonly api = inject(PokemonApiService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly retry$ = new Subject<void>();

  /** Viene del parámetro de ruta `:name`. */
  readonly name = input.required<string>();

  protected readonly state = toSignal(
    combineLatest([toObservable(this.name), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([name]) => toLoadState(this.api.getDetail(name))),
    ),
    { initialValue: { status: 'loading' } as LoadState<PokemonDetail> },
  );

  protected readonly totalStats = computed(() => {
    const state = this.state();
    return state.status === 'success'
      ? state.data.stats.reduce((sum, stat) => sum + stat.value, 0)
      : 0;
  });

  protected statPercent(value: number): number {
    return Math.min(100, (value / MAX_BASE_STAT) * 100);
  }

  protected retry(): void {
    this.retry$.next();
  }

  /** Vuelve al listado conservando búsqueda y página si se llegó desde ahí; si no, va al inicio. */
  protected back(): void {
    const cameFromList = (history.state as { fromList?: boolean } | null)?.fromList;
    if (cameFromList) {
      this.location.back();
    } else {
      void this.router.navigate(['/']);
    }
  }
}
