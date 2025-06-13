import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  findAll() {
    return { status: 'OK', message: 'Service is OK' };
  }
}
