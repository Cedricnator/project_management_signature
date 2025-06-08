import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SignDocumentDto {
  @IsUUID()
  documentId: string;
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
