import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../security/security.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsersModule, SecurityModule, ConfigModule],
  exports: [AuthService],
})
export class AuthModule {}
