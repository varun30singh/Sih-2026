import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createUserWithProfile, RegistrationInput } from './registration';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('A user with this phone already exists');
    }

    try {
      const user = await this.prisma.users.create({
        data: {
          phone: createUserDto.phone,
          email: createUserDto.email,
          password_hash: await bcrypt.hash(createUserDto.password, 10),
          role: createUserDto.role,
          preferred_language: createUserDto.preferred_language,
        },
      });

      await this.auditLogService.log(null, 'CREATE', 'User', user.id);
      return this.withoutPassword(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('A user with these details already exists');
      }
      throw error;
    }
  }

  async register(registrationInput: RegistrationInput) {
    const user = await createUserWithProfile(this.prisma, registrationInput);
    await this.auditLogService.log(null, 'CREATE', 'User', user.id);
    return this.withoutPassword(user);
  }

  async findAll() {
    const users = await this.prisma.users.findMany();
    return users.map((user) => this.withoutPassword(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.withoutPassword(user);
  }

  findByPhone(phone: string) {
    return this.prisma.users.findUnique({ where: { phone } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    try {
      const user = await this.prisma.users.update({
        where: { id },
        data: {
          phone: updateUserDto.phone,
          email: updateUserDto.email,
          role: updateUserDto.role,
          preferred_language: updateUserDto.preferred_language,
        },
      });

      await this.auditLogService.log(null, 'UPDATE', 'User', user.id);
      return this.withoutPassword(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('A user with these details already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const user = await this.prisma.users.delete({ where: { id } });
    await this.auditLogService.log(null, 'DELETE', 'User', user.id);
    return this.withoutPassword(user);
  }

  private withoutPassword<T extends { password_hash: string }>(user: T) {
    const { password_hash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error as Prisma.PrismaClientKnownRequestError).code === 'P2002'
    );
  }
}
