import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import config from "../../config";
import { ChangePasswordPayload, RegisterUserPayload, UpdateProfilePayload } from "./user.interface";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/appError";
import { Prisma, Role, UserStatus } from "../../../../generated/prisma/client";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    nidUrl,
    role,
    image,
  } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "User already exists with this email."
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt.saltRounds)
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      nidUrl,
      image: image ?? null,
      role: role === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
    },
    omit: {
      password: true,
    },
  });

  return createdUser;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return user;
};

const updateMyProfileIntoDB = async (
  userId: string,
  payload: UpdateProfilePayload
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found."
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...payload,
      image: payload.image ?? user.image,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

const changePasswordIntoDB = async (
  userId: string,
  payload: ChangePasswordPayload
) => {
  const { oldPassword, newPassword } = payload;

  // Prevent using the same password
  if (oldPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password must be different from the old password."
    );
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found."
    );
  }

  // OAuth user can't change password
  if (!user.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password change is not available for this account."
    );
  }

  // Verify old password
  const isOldPasswordMatched = await bcrypt.compare(
    oldPassword,
    user.password
  );

  if (!isOldPasswordMatched) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Old password is incorrect."
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    config.bcrypt.saltRounds
  );

  // Update password
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return null;
};

const getAllUsersFromDB = async (query: {
  page?: string;
  limit?: string;
  role?: string;
  status?: string;
  search?: string;
}) => {
  const { page = "1", limit = "10", role, status, search } = query;

  const andConditions: Prisma.UserWhereInput[] = [{ deletedAt: null }];

  if (role) {
    andConditions.push({ role: role as Role });
  }

  if (status) {
    andConditions.push({ status: status as UserStatus });
  }

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const data = await prisma.user.findMany({
    where: whereConditions,
    omit: { password: true },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data,
  };
};

const updateUserStatusIntoDB = async (
  userId: string,
  status: UserStatus
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: { password: true },
  });
};
export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
  changePasswordIntoDB,
  getAllUsersFromDB,
  updateUserStatusIntoDB,
};
