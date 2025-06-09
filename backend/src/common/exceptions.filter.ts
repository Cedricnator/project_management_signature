import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Logging all the unhandled exceptions.
    this.logger.error(
      `[${request.method}] ${request.url} -> ${statusCode}: ${JSON.stringify(
        message,
      )}`,
    );
    // Manejo explícito de HttpException (como BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (exceptionResponse as any).message || message;
      return;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
