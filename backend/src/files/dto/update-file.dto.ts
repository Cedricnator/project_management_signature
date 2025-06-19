import { PartialType } from '@nestjs/mapped-types';
import { UploadFileDto } from './upload-file.dto';

export class UpdateFileDto extends PartialType(UploadFileDto) {}
