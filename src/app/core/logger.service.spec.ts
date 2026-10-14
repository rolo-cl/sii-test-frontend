import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('escribe con formato "hora NIVEL [contexto] mensaje"', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const logger = new LoggerService();
    logger.setLevel('debug');

    logger.info('Test', 'hola', { a: 1 });

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{2}:\d{2}:\d{2}\.\d{3} INFO \[Test\] hola$/),
      { a: 1 },
    );
  });

  it('omite los mensajes bajo el nivel mínimo', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logger = new LoggerService();
    logger.setLevel('warn');

    logger.debug('Test', 'oculto');
    logger.warn('Test', 'visible');

    expect(debug).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
