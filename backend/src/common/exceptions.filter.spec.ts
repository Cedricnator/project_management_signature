import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import {
  NotFoundException,
  ServiceUnavailableException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
  UnauthorizedException,
  ForbiddenException,
  MethodNotAllowedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    // Mock del response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock del ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as any;

    // Mock del Logger para evitar logs durante los tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HTTP Exception Handling', () => {
    it('should handle NotFoundException', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
      });
    });

    it('should handle BadRequestException', () => {
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
      });
    });

    it('should handle UnauthorizedException', () => {
      const exception = new UnauthorizedException('Access denied');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Access denied',
      });
    });

    it('should handle ForbiddenException', () => {
      const exception = new ForbiddenException('Forbidden resource');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
      });
    });

    it('should handle ConflictException', () => {
      const exception = new ConflictException('Resource conflict');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Resource conflict',
      });
    });

    it('should handle UnprocessableEntityException', () => {
      const exception = new UnprocessableEntityException('Validation failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
      });
    });

    it('should handle PayloadTooLargeException', () => {
      const exception = new PayloadTooLargeException('File too large');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'File too large',
      });
    });
  });

  describe('Server Error Handling', () => {
    it('should handle ServiceUnavailableException as INTERNAL_SERVER_ERROR', () => {
      const exception = new ServiceUnavailableException('Service down');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Service down',
      });
    });

    it('should handle BadGatewayException', () => {
      const exception = new BadGatewayException('Gateway error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Gateway error',
      });
    });

    it('should handle MethodNotAllowedException', () => {
      const exception = new MethodNotAllowedException('Method not allowed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.METHOD_NOT_ALLOWED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.METHOD_NOT_ALLOWED,
        message: 'Method not allowed',
      });
    });

    it('should handle UnsupportedMediaTypeException', () => {
      const exception = new UnsupportedMediaTypeException('Unsupported media');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message: 'Unsupported media',
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unknown errors as INTERNAL_SERVER_ERROR', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });

    it('should handle TypeError as INTERNAL_SERVER_ERROR', () => {
      const exception = new TypeError('Type error occurred');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });
  });

  describe('Logging', () => {
    it('should log the exception', () => {
      const exception = new NotFoundException('Test error');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(exception);
    });
  });

  describe('Response Structure', () => {
    it('should always return statusCode and message', () => {
      const exception = new BadRequestException('Test message');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
        })
      );
    });

    it('should chain response methods correctly', () => {
      const exception = new NotFoundException('Test');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalled();
    });
  });
});