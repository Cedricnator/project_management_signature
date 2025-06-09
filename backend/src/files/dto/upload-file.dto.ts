import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
}
