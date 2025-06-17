import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @IsString()
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Comment cannot exceed 500 characters' })
  comment?: string;
}
