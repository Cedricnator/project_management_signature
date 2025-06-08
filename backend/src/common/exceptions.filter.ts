import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ServiceUnavailableException,
  NotFoundException,
  ConflictException,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string = exception.message;

    if (exception instanceof NotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ServiceUnavailableException) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
    } else if (exception instanceof BadGatewayException) {
      statusCode = HttpStatus.BAD_GATEWAY;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    response.status(statusCode).json({ statusCode, message });
  }
}
