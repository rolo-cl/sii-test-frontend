import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import { LoadState, toLoadState } from '../../core/load-state';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { PokemonPage } from '../../core/pokemon.models';
import { PokemonCard } from '../../shared/pokemon-card';

export const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

interface ListQuery {
  search: string;
  page: number;
}

function readQuery(params: ParamMap): ListQuery {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return {
    search: (params.get('q') ?? '').trim(),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/**
 * Catalog page. The URL (`?q=&page=`) is the single source of truth, so searches and
 * pages are shareable and survive reloads / back navigation.
 */
@Component({
  selector: 'app-pokemon-list-page',
  imports: [ReactiveFormsModule, PokemonCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-list.page.html',
  styleUrl: './pokemon-list.page.scss',
})
export class PokemonListPage {
  private readonly api = inject(PokemonApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly retry$ = new Subject<void>();

  private readonly query$ = this.route.queryParamMap.pipe(
    map(readQuery),
    distinctUntilChanged((a, b) => a.search === b.search && a.page === b.page),
  );

  protected readonly query = toSignal(this.query$, { requireSync: true });

  protected readonly state = toSignal(
    combineLatest([this.query$, this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([{ search, page }]) =>
        toLoadState(this.api.list({ page, pageSize: PAGE_SIZE, search: search || undefined })),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<PokemonPage> },
  );

  /** Last successful page, kept while the next one loads to avoid flicker. */
  protected readonly result = linkedSignal<LoadState<PokemonPage>, PokemonPage | null>({
    source: this.state,
    computation: (state, previous) => {
      if (state.status === 'success') return state.data;
      if (state.status === 'loading') return previous?.value ?? null;
      return null;
    },
  });

  protected readonly loading = computed(() => this.state().status === 'loading');
  protected readonly failed = computed(() => this.state().status === 'error');

  protected readonly searchControl = new FormControl(this.query().search, { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => {
        if (search !== this.query().search) {
          this.navigate({ q: search || null, page: null }, true);
        }
      });

    // Keep the input in sync when the URL changes from outside (back/forward, links).
    effect(() => {
      const { search } = this.query();
      if (this.searchControl.value.trim() !== search) {
        this.searchControl.setValue(search, { emitEvent: false });
      }
    });
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  protected clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.navigate({ q: null, page: null });
  }

  protected retry(): void {
    this.retry$.next();
  }

  private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
