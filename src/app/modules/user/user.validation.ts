import { z } from "zod";
import { UserStatus } from "../../../../generated/prisma/enums";

const registerUserValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  phone: z.string().optional(),

  address: z.string().optional(),

  nidUrl: z.string().url("Invalid NID URL").optional(),
  role: z.enum(["CUSTOMER", "PROVIDER"]).optional(),
});

const updateProfileValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  phone: z.string().trim().optional(),

  address: z.string().trim().optional(),

  nidUrl: z
    .string()
    .url("Invalid NID URL")
    .optional(),
  role: z.enum(["CUSTOMER", "PROVIDER"]).optional(),
});

const changePasswordValidationSchema = z.object({
  oldPassword: z
    .string()
    .trim()
    .min(6, "Old password must be at least 6 characters")
    .max(100, "Old password cannot exceed 100 characters"),

  newPassword: z
    .string()
    .trim()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password cannot exceed 100 characters"),
});
const updateUserStatusValidationSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const userValidation = {
  registerUserValidationSchema,
  updateProfileValidationSchema,
  changePasswordValidationSchema,
  updateUserStatusValidationSchema
};