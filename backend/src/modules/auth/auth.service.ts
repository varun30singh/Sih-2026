import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    let profileData: Record<string, any> = {};
    if (user.role === 'farmer') {
      const farmer = await this.prisma.farmers.findFirst({
        where: { user_id: user.id },
      });
      if (farmer) {
        profileData = {
          farmer_id: farmer.id,
          farmer: {
            id: farmer.id,
            name: farmer.name,
            village: farmer.village,
            phone: farmer.phone,
          },
        };
      }
    } else if (user.role === 'stockist') {
      const stockist = await this.prisma.stockists.findFirst({
        where: { user_id: user.id },
      });
      if (stockist) {
        profileData = {
          stockist_id: stockist.id,
          stockist: {
            id: stockist.id,
            business_name: stockist.business_name,
          },
        };
      }
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      ...(profileData.farmer_id && { farmer_id: profileData.farmer_id }),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...this.withoutPassword(user),
        ...profileData,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user: any = await this.usersService.register(registerDto);
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      ...(user.farmer_id && { farmer_id: user.farmer_id }),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private withoutPassword<T extends { password_hash: string }>(user: T) {
    const { password_hash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
