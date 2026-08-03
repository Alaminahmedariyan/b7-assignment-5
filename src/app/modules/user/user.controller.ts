import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { userService } from "./user.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const user = await userService.registerUserIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User registered successfully.",
    data: user,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getMyProfileFromDB(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile retrieved successfully.",
    data: user,
  });
});

// CHANGED: now passes req.file (from upload.single("image")) as a
// separate argument — same idea as gearController.createGear passing
// req.files alongside req.body.
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateMyProfileIntoDB(
    req.user!.id,
    req.body,
    req.file as Express.Multer.File | undefined,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile updated successfully.",
    data: user,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await userService.changePasswordIntoDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password changed successfully.",
    data: null,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUsersFromDB(req.query as any);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUserStatusIntoDB(
    req.params.id as string,
    req.body.status
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User status updated successfully.",
    data: result,
  });
});

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
};