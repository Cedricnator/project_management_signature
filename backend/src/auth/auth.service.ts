import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { AuthentificationInput } from './dto/authInput-auth.dto';
import { UsersService } from '../users/users.service';

type AuthResult = {
  userId: number;
  userName: string;
  role: string;
  token: string;
};

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async autenticate(
    authInput: AuthentificationInput,
  ): Promise<AuthResult | undefined> {
    const user = await this.validateUser(authInput);
    if (!user) throw new UnauthorizedException('Unauthorized');
    return {
      userName: user.userName,
      userId: user.userId,
      role: user.role,
      token: `token-${user.userId}-${user.role}`, // This is a placeholder for a real token generation logic
    };
  }

  async validateUser(
    authInput: AuthentificationInput,
  ): Promise<SignInAuthDto | undefined> {
    const user = await this.userService.findByName(authInput.userName);
    if (user && user.password === authInput.password)
      return {
        userId: user.userId,
        userName: user.userName,
        role: user.role,
      };
    return undefined;
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
