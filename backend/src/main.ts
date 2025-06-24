import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerInterceptor } from './common/logger.interceptor';
import * as compression from 'compression';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);
  const port = 3000;
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.enableCors();

  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024,
    level: 4
  }));

  const config = new DocumentBuilder()
    .setTitle('Firma Tic')
    .setDescription('Api documentation for Firma Tic')
    .setVersion('0.1')
    .addTag('firma-tic')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // opcional, solo informativo
        in: 'header',
        name: 'Authorization',
      },
      'jwt', // ← este nombre debe coincidir con el de @ApiBearerAuth('jwt')
    )
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);
  logger.log(`Server is running on port: ${port}`);
  logger.log(`Swagger is available at: http://localhost:${port}/api`);
  logger.log(`App is running in ${process.env.APP_ENV || 'development'} mode`);
}

void bootstrap();
