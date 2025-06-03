import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { AuthentificationInput } from './dto/auth-input-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResult } from './dto/auth-result-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async autenticate(
    authInput: AuthentificationInput,
  ): Promise<AuthResult | undefined> {
    const user = await this.validateUser(authInput);
    if (!user) throw new UnauthorizedException('Unauthorized');
    return this.signIn(user);
  }

  async validateUser(
    authInput: AuthentificationInput,
  ): Promise<SignInAuthDto | undefined> {
    const user = await this.userService.findOneByEmail(authInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const isValidPassword = await bcrypt.compare(
      authInput.password,
      user.password,
    );
    if (isValidPassword)
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    throw new UnauthorizedException('Invalid password');
  }

  async signIn(user: SignInAuthDto): Promise<AuthResult> {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.signAsync(tokenPayload);
    return {
      email: user.email,
      role: user.role,
      token: await token, // Await the promise to get the token string
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
