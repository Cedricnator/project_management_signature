import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SignDocumentDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  comment?: string;
}