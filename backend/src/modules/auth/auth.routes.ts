import { Router } from "express";
import { authController } from "./auth.module.js";
import { authenticate } from "../../strategies/jwt.strategy.js";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/verify/email", authController.verifyEmail);

authRoutes.post("/login", authController.login);
authRoutes.get("/refresh", authController.refreshToken);
authRoutes.post("/logout", authenticate, authController.logout);

export default authRoutes;
