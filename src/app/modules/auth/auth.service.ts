import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { OAuth2Client } from "google-auth-library";
import config from "../../config";
import AppError from "../../errors/appError";

import { LoginUserPayload } from "./auth.interface";
import { prisma } from "../../../lib/prisma";
import { jwtUtils } from "../../../lib/jwt";

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

  const verifiedToken = jwtUtils.verifyToken(token, config.jwt.refreshSecret);

  if (!verifiedToken.success) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token.");
  }

  const { id } = verifiedToken.data as JwtPayload;

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

export const authService = {
  loginUser,
  refreshToken,
  loginWithGoogle,
};