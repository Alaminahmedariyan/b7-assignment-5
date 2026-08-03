import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { OAuth2Client } from "google-auth-library";
import config from "../../config";
import AppError from "../../errors/appError";

import { ForgotPasswordPayload, LoginUserPayload, ResetPasswordPayload } from "./auth.interface";
import { prisma } from "../../../lib/prisma";
import { jwtUtils } from "../../../lib/jwt";
import { sendEmail } from "../../utils/sendEmail";

const googleClient = new OAuth2Client(config.google.clientId);

const loginUser = async (payload: LoginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invalid Credentials");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been suspended.");
  }

  if (!user.password) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Please login with Google.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.secret,
    config.jwt.expiresIn as SignOptions["expiresIn"]
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn as SignOptions["expiresIn"]
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token is missing.");
  }

let verifiedToken: JwtPayload;

try {
  verifiedToken = jwtUtils.verifyToken(
    token,
    config.jwt.refreshSecret
  );
} catch {
  throw new AppError(
    StatusCodes.UNAUTHORIZED,
    "Invalid refresh token."
  );
}

const { id } = verifiedToken as JwtPayload;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been suspended.");
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.secret,
    config.jwt.expiresIn as SignOptions["expiresIn"]
  );

  return { accessToken };
};

const loginWithGoogle = async (idToken: string) => {
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    payload = ticket.getPayload();
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid Google token."
    );
  }

  if (!payload?.email || !payload.email_verified) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Google account email is not verified."
    );
  }

  let user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  // Create user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name ?? payload.email.split("@")[0] ?? "User",
        email: payload.email,
        provider: "GOOGLE",
        password: null,
        status: "ACTIVE",

        // ✅ Save Google profile picture
        image: payload.picture ?? null,
      },
    });
  }

  // Optional: update image if Google picture changed
  else if (!user.image && payload.picture) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: payload.picture,
      },
    });
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account has been suspended."
    );
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.secret,
    config.jwt.expiresIn as SignOptions["expiresIn"]
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn as SignOptions["expiresIn"]
  );

  return {
    accessToken,
    refreshToken,
    role: user.role,
  };
};

const forgotPassword = async (
  payload: ForgotPasswordPayload
) => {
  const { email } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Security: don't reveal whether user exists
  if (!user) {
    return null;
  }

  // Google account can't reset password
  if (!user.password) {
    return null;
  }

  const token = jwtUtils.createToken(
    { id: user.id },
    config.jwt.resetPasswordSecret,
    config.jwt.resetPasswordExpiresIn as SignOptions["expiresIn"]
  );

  const resetLink = `${config.app.clientUrl}/reset-password?token=${token}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    `
      <h2>Password Reset</h2>

      <p>Hello ${user.name},</p>

      <p>Click the button below to reset your password.</p>

      <a
        href="${resetLink}"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#2563eb;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>
    `
  );

  return null;
};

const resetPassword = async (
  payload: ResetPasswordPayload
) => {
  const { token, newPassword } = payload;

  let decoded: JwtPayload;

  try {
    decoded = jwtUtils.verifyToken(
      token,
      config.jwt.resetPasswordSecret
    );
  } catch {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Reset link is invalid or has expired."
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found."
    );
  }

  if (!user.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Google account password cannot be reset."
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt.saltRounds)
  );

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

export const authService = {
  loginUser,
  refreshToken,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
};