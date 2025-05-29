import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SignatureModule } from './signature/signature.module';

@Module({
  imports: [UsersModule, FilesModule, AuthModule, SignatureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
