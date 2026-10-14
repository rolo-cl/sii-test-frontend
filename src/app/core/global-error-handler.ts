import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

/** Captura los errores no controlados de Angular y los registra con el logger de la app. */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error('App', `Error no controlado: ${message}`, error);
  }
}
