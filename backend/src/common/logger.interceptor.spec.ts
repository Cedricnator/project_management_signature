import { LoggerInterceptor } from './logger.interceptor';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggerInterceptor();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log request details', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' })
      })
    } as any;

    const mockHandler = {
      handle: () => of('response')
    };

    interceptor.intercept(mockContext, mockHandler);

    expect(loggerSpy).toHaveBeenCalledWith('Request to GET /test');
  });

  it('should log completion time', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', url: '/api' })
      })
    } as any;

    const mockHandler = {
      handle: () => of('response')
    };

    const result = interceptor.intercept(mockContext, mockHandler);

    result.subscribe(() => {
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Request to POST \/api took \d+ms/)
      );
      done();
    });
  });
});