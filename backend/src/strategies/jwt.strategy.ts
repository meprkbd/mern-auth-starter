import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { UnauthorizedException } from "../utils/catchErrors.js";
import { verifyJwtToken, type AccessTPayload } from "../utils/jwt.js";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const cookieToken = req.cookies?.accessToken as string | undefined;

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    const token = cookieToken || bearerToken;

    if (!token) {
      throw new UnauthorizedException("Missing access token");
    }

    const { payload, error } = verifyJwtToken<AccessTPayload>(token);
    if (!payload || error) {
      throw new UnauthorizedException(error || "Invalid access token");
    }
    req.sessionId = String(payload.sessionId);
    req.userId = String(payload.userId);
    next();
  },
);
