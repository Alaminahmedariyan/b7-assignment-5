import { z } from "zod";

const loginValidationSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const googleLoginValidationSchema = z.object({
  idToken: z
    .string()
    .min(1, "Google ID token is required."),
});

const forgotPasswordValidationSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email"),
});

const resetPasswordValidationSchema = z.object({
  token: z.string(),

  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const authValidation = {
  loginValidationSchema,
  googleLoginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};