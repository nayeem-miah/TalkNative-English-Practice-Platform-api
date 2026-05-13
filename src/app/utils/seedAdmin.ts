import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import config from '../config';
import { prisma } from '../prisma/prisma';

interface IUser {
  name: string;
  email: string;
  role: UserRole;
}

export const seedAdmin = async () => {
  const payload: IUser = {
    name: 'Admin',
    email: config.admin.email as string,
    role: UserRole.ADMIN,
  };
  const hashedPassword = await bcrypt.hash(
    config.admin.password as string,
    config.salt_rounds as number,
  );

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;

  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
  });

  console.log(result);
};
