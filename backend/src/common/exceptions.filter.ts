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
  UnauthorizedException,
  ForbiddenException,
  MethodNotAllowedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
  BadRequestException,
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
    } else if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
    } else if (exception instanceof BadGatewayException) {
      statusCode = HttpStatus.BAD_GATEWAY;
    } else if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof ForbiddenException) {
      statusCode = HttpStatus.FORBIDDEN;
    } else if (exception instanceof MethodNotAllowedException) {
      statusCode = HttpStatus.METHOD_NOT_ALLOWED;
    } else if (exception instanceof UnprocessableEntityException) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    } else if (exception instanceof UnsupportedMediaTypeException) {
      statusCode = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
    } else if (exception instanceof PayloadTooLargeException) {
      statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    response.status(statusCode).json({ statusCode, message });
  }
}
