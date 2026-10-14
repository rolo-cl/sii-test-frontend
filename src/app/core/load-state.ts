import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, startWith } from 'rxjs';

export type LoadState<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; notFound: boolean };

/** Envuelve un request para que los templates muestren carga / éxito / error sin flags manuales. */
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
