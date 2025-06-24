import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(authInput: AuthentificationInput): Promise<AuthResult> {
    this.logger.log(`Authenticating user with email: ${authInput.email}`);
    const user = await this.validateUser(authInput);
    if (!user) throw new UnauthorizedException('Unauthorized');
    this.logger.log(`User ${user.email} authenticated successfully`);
    return this.signIn(user);
  }

  async validateUser(
    authInput: AuthentificationInput,
  ): Promise<SignInAuthDto | undefined> {
    const user = await this.userService.findOneByEmail(authInput.email);
    if (!user) {
      this.logger.warn(`User with email ${authInput.email} not found`);
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
    this.logger.warn(`Invalid password for user with email ${authInput.email}`);
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
    this.logger.log(`Verifying token`);
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new UnauthorizedException('JWT_SECRET not configured');
    try {
      const payload = jwt.verify(token, secret) as unknown as JwtPayload;
      return payload;
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new UnauthorizedException('Invalid token or expired');
    }
  }
}
