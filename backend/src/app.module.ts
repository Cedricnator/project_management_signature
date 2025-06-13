import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SignatureModule } from './signature/signature.module';
import { DatabaseModule } from './common/database.module';
import { CommonModule } from './common/common.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    UsersModule,
    FilesModule,
    AuthModule,
    SignatureModule,
    UsersModule,
    CommonModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
