import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SignatureModule } from './signature/signature.module';
import { DatabaseModule } from './common/database.module';
import { SecurityModule } from './security/security.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    UsersModule,
    FilesModule,
    AuthModule,
    SignatureModule,
    UsersModule,
    SecurityModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
