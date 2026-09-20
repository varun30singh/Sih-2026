import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.withoutPassword(user),
    };
  }

  private withoutPassword<T extends { password_hash: string }>(user: T) {
    const { password_hash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
