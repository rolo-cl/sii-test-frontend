import { Injectable, isDevMode } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

/**
 * Logger centralizado del frontend. Escribe en la consola del navegador con un formato común
 * (`HH:mm:ss.SSS NIVEL [contexto] mensaje`). En desarrollo muestra todo; en producción, desde `info`.
 * Al ser el único punto de salida, se podría enviar a un servicio externo sin tocar el resto de la app.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private minLevel: LogLevel = isDevMode() ? 'debug' : 'info';

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(context: string, message: string, ...data: unknown[]): void {
    this.write('debug', context, message, data);
  }

  info(context: string, message: string, ...data: unknown[]): void {
    this.write('info', context, message, data);
  }

  warn(context: string, message: string, ...data: unknown[]): void {
    this.write('warn', context, message, data);
  }

  error(context: string, message: string, ...data: unknown[]): void {
    this.write('error', context, message, data);
  }

  private write(level: LogLevel, context: string, message: string, data: unknown[]): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) {
      return;
    }
    const now = new Date();
    const time = `${now.toTimeString().slice(0, 8)}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const line = `${time} ${level.toUpperCase()} [${context}] ${message}`;
    console[level](line, ...data);
  }
}
