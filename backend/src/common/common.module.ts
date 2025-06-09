import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CommonModule {}
