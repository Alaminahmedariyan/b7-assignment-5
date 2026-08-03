import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { upload } from "../../middlewares/multer";

import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.registerUserValidationSchema),
  userController.registerUser
);
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  userController.getMyProfile
);

// NEW: upload.single("image") added — same pattern as gear routes.
// Multer parses the multipart form, puts the file in req.file, and
// leaves the other text fields (name, phone, address) in req.body
// as plain strings — which is exactly what updateProfileValidationSchema
// expects.
router.patch(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  upload.single("image"),
  validateRequest(userValidation.updateProfileValidationSchema),
  userController.updateMyProfile
);

router.patch(
  "/change-password",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  validateRequest(userValidation.changePasswordValidationSchema),
  userController.changePassword
);

router.get("/", auth(Role.ADMIN), userController.getAllUsers);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(userValidation.updateUserStatusValidationSchema),
  userController.updateUserStatus
);

export const userRoutes = router;