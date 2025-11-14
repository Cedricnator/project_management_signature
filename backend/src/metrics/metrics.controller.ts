import { Controller, Get } from '@nestjs/common';
import { MetricsService, SystemMetrics } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(): Promise<SystemMetrics> {
    return this.metricsService.getSystemMetrics();
  }
}
