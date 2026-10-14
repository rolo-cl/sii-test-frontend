import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { REQUEST_ID_HEADER, httpLoggingInterceptor } from './http-logging.interceptor';
import { LoggerService } from './logger.service';

describe('httpLoggingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let logger: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpLoggingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoggerService, useValue: logger },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('agrega un X-Request-Id y registra la respuesta exitosa', () => {
    http.get('/api/pokemon').subscribe();
    const req = httpMock.expectOne('/api/pokemon');
    const requestId = req.request.headers.get(REQUEST_ID_HEADER);
    expect(requestId).toBeTruthy();

    req.flush({});
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP',
      expect.stringMatching(new RegExp(`GET /api/pokemon 200 .*\\[${requestId}\\]`)),
    );
  });

  it('registra un 404 como warning', () => {
    http.get('/api/pokemon/missingno').subscribe({ error: () => undefined });
    httpMock
      .expectOne('/api/pokemon/missingno')
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(logger.warn).toHaveBeenCalledWith('HTTP', expect.stringContaining('404'));
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('registra un 5xx como error', () => {
    http.get('/api/pokemon').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/pokemon').flush(null, { status: 502, statusText: 'Bad Gateway' });

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP',
      expect.stringContaining('502'),
      expect.anything(),
    );
  });
});
