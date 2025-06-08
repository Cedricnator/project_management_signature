import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SignatureModule } from './signature/signature.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { DocumentStatusType } from './files/entities/document_status_type.entity';
import { DocumentHistory } from './files/entities/document_history.entity';
import { File } from './files/entities/file.entity';
import { AccountDocument } from './signature/entities/account-document.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db-signature-project-management',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'signature_project',
      entities: [
        User,
        File,
        DocumentStatusType,
        DocumentHistory,
        AccountDocument,
      ],
      synchronize: false,
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    SignatureModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
