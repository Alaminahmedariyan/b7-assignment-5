import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { authService } from "./auth.service";
import { ForgotPasswordPayload, ResetPasswordPayload } from "./auth.interface";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Login successful.",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  const result = await authService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Access token refreshed successfully.",
    data: result,
  });
});

const logoutUser = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Logout successful.",
    data: null,
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginWithGoogle(req.body.idToken);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Google login successful.",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(
    req.body as ForgotPasswordPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      "If an account exists, a password reset email has been sent.",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(
    req.body as ResetPasswordPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset successfully.",
    data: null,
  });
});

export const authController = {
  loginUser,
  refreshToken,
  logoutUser,
  googleLogin,
  forgotPassword,
  resetPassword,
};