import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, startWith } from 'rxjs';

export type LoadState<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; notFound: boolean };

/** Wraps a request so templates can render loading / success / error without manual flags. */
export function toLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    catchError((error: unknown) =>
      of<LoadState<T>>({
        status: 'error',
        notFound: error instanceof HttpErrorResponse && error.status === 404,
      }),
    ),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}
