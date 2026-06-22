/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request } from "express";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import emailSender from "../../utils/emailSender";
import { getOtpTemplate } from "../../utils/emailTemplates";

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

      emailSender(
        "Verify Your Account - TalkNative",
        updatedUser.email,
        getOtpTemplate(updatedUser.name || updatedUser.email, verificationCode)
      ).catch(err => console.error("Email error:", err));

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
  emailSender(
    "Verify Your Account - TalkNative",
    result.email,
    getOtpTemplate(result.name || result.email, verificationCode)
  ).catch(err => console.error("Email error:", err));

  return result;
};

const findUserById = async (id: string) => {

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        Phone: true,
        profilePicture: true,
        isVerified: true,
        bio: true,
        nativeLanguage: true,
        learningLanguage: true,
        totalMinutesSpent: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
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
        status: true,
        Phone: true,
        profilePicture: true,
        isVerified: true,
        bio: true,
        nativeLanguage: true,
        learningLanguage: true,
        totalMinutesSpent: true,
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
  const { name, oldPassword, newPassword, phone, nativeLanguage, learningLanguage, bio } = payload;


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

  if (phone !== undefined) updateData.Phone = phone;
  if (nativeLanguage !== undefined) updateData.nativeLanguage = nativeLanguage;
  if (learningLanguage !== undefined) updateData.learningLanguage = learningLanguage;
  if (bio !== undefined) updateData.bio = bio;

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

const updateUserRole = async (userId: string, role: UserRole) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return updatedUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  findUserById,
  getSingleUser,
  userUpdateProfile,
  deleteUser,
  updateUserRole
};
