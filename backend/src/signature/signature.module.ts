import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { DocumentStatusType } from 'src/files/entities/document_status_type.entity';
import { DocumentHistory } from 'src/files/entities/document_history.entity';
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
