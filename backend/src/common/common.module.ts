import { Module } from '@nestjs/common';
import { RoleGuard } from './guard/role.guard';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [RoleGuard, Reflector, JwtAuthGuard, ConfigService],
  exports: [JwtAuthGuard, RoleGuard, ConfigService],
})
export class CommonModule {}
