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

      let profileData: Record<string, any> = {};

      switch (input.role) {
        case user_role.farmer:
          if (!input.name) {
            throw new BadRequestException('name is required for farmer registration');
          }
          const farmer = await tx.farmers.create({
            data: {
              user_id: user.id,
              name: input.name,
              id_proof: input.id_proof,
              village: input.village,
              phone: input.phone,
            },
          });
          profileData = {
            farmer_id: farmer.id,
            farmer: {
              id: farmer.id,
              name: farmer.name,
              village: farmer.village,
              phone: farmer.phone,
            },
          };
          break;
        case user_role.retail_user:
          const retailUser = await tx.retail_users.create({ data: { user_id: user.id } });
          profileData = { retail_user_id: retailUser.id };
          break;
        case user_role.stockist:
          const stockist = await tx.stockists.create({
            data: {
              user_id: user.id,
              business_name: input.business_name,
            },
          });
          profileData = {
            stockist_id: stockist.id,
            stockist: {
              id: stockist.id,
              business_name: stockist.business_name,
            },
          };
          break;
        case user_role.broker:
          const broker = await tx.brokers.create({ data: { user_id: user.id } });
          profileData = { broker_id: broker.id };
          break;
        case user_role.buyer:
          const buyer = await tx.buyers.create({ data: { user_id: user.id } });
          profileData = { buyer_id: buyer.id };
          break;
        case user_role.operator:
          const operator = await tx.operators.create({ data: { user_id: user.id } });
          profileData = { operator_id: operator.id };
          break;
        case user_role.admin:
          break;
        default:
          throw new BadRequestException('This role cannot be registered');
      }

      return {
        ...user,
        ...profileData,
      };
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