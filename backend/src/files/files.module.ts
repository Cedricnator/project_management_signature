import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';
import { randomBytes } from 'crypto';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, DocumentStatusType, DocumentHistory]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + randomBytes(8).toString('hex');
          const ext = extname(file.originalname);
          const fileName = `${file.originalname}-${uniqueSuffix}${ext}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB - Reduced limit to prevent DoS attacks
      },
    }),
    SecurityModule,
    UsersModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
