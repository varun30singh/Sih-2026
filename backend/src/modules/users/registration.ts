import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient, user_role } from '../../generated/prisma/client';

export const REGISTRABLE_ROLES = [
  user_role.farmer,
  user_role.retail_user,
  user_role.stockist,
  user_role.broker,
  user_role.buyer,
] as const;

export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

export interface RegistrationInput {
  phone: string;
  password: string;
  role: user_role;
  email?: string;
  preferred_language?: string;
  name?: string;
  id_proof?: string;
  village?: string;
  business_name?: string;
}

export function isRegistrableRole(role: user_role): role is RegistrableRole {
  return REGISTRABLE_ROLES.includes(role as RegistrableRole);
}

export async function createUserWithProfile(
  prisma: PrismaClient,
  input: RegistrationInput,
) {
  const existingUser = await prisma.users.findUnique({
    where: { phone: input.phone },
  });

  if (existingUser) {
    throw new ConflictException('A user with this phone already exists');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          phone: input.phone,
          email: input.email,
          password_hash: await bcrypt.hash(input.password, 10),
          role: input.role,
          preferred_language: input.preferred_language,
        },
      });

      switch (input.role) {
        case user_role.farmer:
          if (!input.name) {
            throw new BadRequestException('name is required for farmer registration');
          }
          await tx.farmers.create({
            data: {
              user_id: user.id,
              name: input.name,
              id_proof: input.id_proof,
              village: input.village,
              phone: input.phone,
            },
          });
          break;
        case user_role.retail_user:
          await tx.retail_users.create({ data: { user_id: user.id } });
          break;
        case user_role.stockist:
          await tx.stockists.create({
            data: {
              user_id: user.id,
              business_name: input.business_name,
            },
          });
          break;
        case user_role.broker:
          await tx.brokers.create({ data: { user_id: user.id } });
          break;
        case user_role.buyer:
          await tx.buyers.create({ data: { user_id: user.id } });
          break;
        case user_role.operator:
          await tx.operators.create({ data: { user_id: user.id } });
          break;
        case user_role.admin:
          break;
        default:
          throw new BadRequestException('This role cannot be registered');
      }

      return user;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A user with these details already exists');
    }
    throw error;
  }
}