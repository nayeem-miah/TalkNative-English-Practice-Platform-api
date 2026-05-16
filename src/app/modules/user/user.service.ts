/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { Request } from "express";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import { UserRole } from "@prisma/client";
import emailSender from "../../utils/emailSender";

const createUser = async (req: Request) => {
  const { password } = req.body;

  const isExistingUser = await prisma.user.findUnique({
    where: {
      email: req.body.email
    }
  })

  if (!password) {
    throw new ApiError(500, "password is required")
  }

  const hashPassword = await bcrypt.hash(password, 10)

  if (isExistingUser) {
    // If user exists but is not verified, resend OTP instead of throwing error
    if (!isExistingUser.isVerified) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

      const updatedUser = await prisma.user.update({
        where: { email: req.body.email },
        data: {
          verificationCode,
          verificationCodeExpires
        }
      });

      await emailSender(
        "Verify Your Account - FluentFlow",
        updatedUser.email,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00d2ff;">Welcome Back to FluentFlow!</h2>
          <p>It looks like you haven't verified your account yet. Your new verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${verificationCode}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
        `
      );

      return updatedUser;
    }
    throw new ApiError(403, "User already exists!")
  }



  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role ?? UserRole.USER,
      profilePicture: "https://i.ibb.co.com/q2gwGfV/356306451-54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg",
      verificationCode,
      verificationCodeExpires,
    }
  })

  // Send verification email in the background to speed up response
  await emailSender(
    "Verify Your Account - FluentFlow",
    result.email,
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #00d2ff;">Welcome to FluentFlow!</h2>
      <p>Your 6-digit verification code is:</p>
      <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${verificationCode}</h1>
      <p>This code will expire in 5 minutes.</p>
    </div>
    `
  );

  return result;
};

const findUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw new ApiError(500, `Error finding user: ${error}`);
  }
};


const getAllUsers = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      ...prismaQuery,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where: prismaQuery.where }),
  ]);

  return {
    meta: qb.getMeta(total),
    data,
  };
};



const getSingleUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const userUpdateProfile = async (userId: string, payload: any) => {
  const { name, oldPassword, newPassword } = payload;


  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData: any = {};

  // update name
  if (name) {
    updateData.name = name;
  }

  // update password
  if (oldPassword && newPassword) {

    if (!user.password) {
      throw new Error("Password not set for this user");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }


  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};



export const UserService = {
  createUser,
  getAllUsers,
  findUserById,
  getSingleUser,
  userUpdateProfile,
  deleteUser
};