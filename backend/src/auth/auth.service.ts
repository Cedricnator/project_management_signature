import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { AuthentificationInput } from './dto/auth-input-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResult } from './dto/auth-result-auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(authInput: AuthentificationInput): Promise<AuthResult> {
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

  verifyToken(token: string): JwtPayload {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new UnauthorizedException('JWT_SECRET not configured');
    try {
      const payload = jwt.verify(token, secret) as unknown as JwtPayload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado' + error);
    }
  }
}
