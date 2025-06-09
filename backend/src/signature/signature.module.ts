import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DocumentStatusType } from '../files/entities/document_status_type.entity';
import { DocumentHistory } from '../files/entities/document_history.entity';
import { AccountDocument } from './entities/account-document.entity';
import { FilesModule } from '../files/files.module';
import { File } from '../files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      File,
      DocumentStatusType,
      DocumentHistory,
      AccountDocument,
    ]),
    FilesModule,
  ],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
