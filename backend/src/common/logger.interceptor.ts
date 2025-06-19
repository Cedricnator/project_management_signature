import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;

    this.logger.log(`Incoming request: ${method} ${url}`);

    const now = Date.now();
    return next.handle().pipe(
      map(() => {
        this.logger.log(
          `Response: ${method} ${url} - ${Date.now() - now}ms\n}`,
        );
      }),
    );
  }
}
