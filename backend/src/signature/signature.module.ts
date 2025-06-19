import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DocumentStatusType } from '../files/entities/document_status_type.entity';
import { DocumentHistory } from '../files/entities/document_history.entity';
import { SignDocument } from './entities/account-document.entity';
import { FilesModule } from '../files/files.module';
import { File } from '../files/entities/file.entity';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      File,
      DocumentStatusType,
      DocumentHistory,
      SignDocument,
    ]),
    FilesModule,
    SecurityModule,
    UsersModule,
  ],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
