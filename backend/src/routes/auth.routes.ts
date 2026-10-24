import { Router } from "express";
import {
  loginController,
  logoutController,
  profileController,
  refreshController,
  registerController,
  updateProfileController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);
authRouter.get("/profile", authMiddleware, profileController);
authRouter.patch("/profile", authMiddleware, updateProfileController);
