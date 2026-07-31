import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { loginRateLimiter } from "../../middlewares/rateLimiter";
const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(authValidation.loginValidationSchema),
  authController.loginUser
);
router.post(
  "/google",
  loginRateLimiter,
  validateRequest(authValidation.googleLoginValidationSchema),
  authController.googleLogin
);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logoutUser);

export const authRoutes = router;
