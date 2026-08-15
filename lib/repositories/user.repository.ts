import { prisma } from "@/lib/db";

export type CreateUserInput = {
  email: string;
  name: string;
  password: string; 
};

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserInput) {
    return prisma.user.create({ data });
  }
}

export const userRepository = new UserRepository();
