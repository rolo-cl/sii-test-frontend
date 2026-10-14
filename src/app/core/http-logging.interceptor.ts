import {
  HttpErrorResponse,
  HttpEventType,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LoggerService } from './logger.service';

export const REQUEST_ID_HEADER = 'X-Request-Id';
const CONTEXT = 'HTTP';

/** `crypto.randomUUID` solo existe en contextos seguros (https o localhost); si no, se usa un id aleatorio simple. */
export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function describe(req: HttpRequest<unknown>): string {
  return `${req.method} ${req.urlWithParams}`;
}

/**
 * Registra cada llamada HTTP con su status y duración, y le agrega un `X-Request-Id`.
 * El BFF usa ese mismo id en sus logs, así se puede seguir un request de punta a punta.
 */
export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const requestId = createRequestId();
  const startedAt = performance.now();
  const elapsed = () => `${Math.round(performance.now() - startedAt)}ms`;

  logger.debug(CONTEXT, `→ ${describe(req)} [${requestId}]`);

  return next(req.clone({ setHeaders: { [REQUEST_ID_HEADER]: requestId } })).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          logger.info(CONTEXT, `← ${describe(req)} ${event.status} (${elapsed()}) [${requestId}]`);
        }
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const message = `✕ ${describe(req)} ${status || 'sin respuesta'} (${elapsed()}) [${requestId}]`;
        // 4xx son esperables (p. ej. un Pokémon que no existe); 5xx o sin conexión son fallas reales.
        if (status >= 400 && status < 500) {
          logger.warn(CONTEXT, message);
        } else {
          logger.error(CONTEXT, message, error);
        }
      },
    }),
  );
};
