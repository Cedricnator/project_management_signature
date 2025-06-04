import { IsNotEmpty, IsString } from 'class-validator';

export class AuthentificationInput {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
