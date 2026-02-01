import { HttpStatus } from "../../config/http.config.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  NotFoundException,
  UnauthorizedException,
} from "../../utils/catchErrors.js";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../../utils/cookie.js";
import {
  loginSchema,
  registerSchema,
  verificationEmailSchema,
} from "../../validators/auth.validator.js";
import type { AuthService } from "./auth.service.js";
import type { Request, Response } from "express";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({
        ...req.body,
      });
      const { user } = await this.authService.register(body);
      return res.status(HttpStatus.CREATED).json({
        message: "User registered successfully",
        data: user,
      });
    },
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { code } = verificationEmailSchema.parse(req.body);
      await this.authService.verifyEmail(code);

      return res.status(HttpStatus.OK).json({
        message: "Email verified successfully",
      });
    },
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"];
      const body = loginSchema.parse({
        ...req.body,
        userAgent,
      });

      const { user, accessToken, refreshToken } =
        await this.authService.login(body);

      return setAuthCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HttpStatus.OK)
        .json({
          message: "User login successfully",
          user,
        });
    },
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.cookies.refreshToken as string | undefined;
      if (!refreshToken) {
        throw new UnauthorizedException("Missing refresh token");
      }

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      if (newRefreshToken) {
        res.cookie(
          "refreshToken",
          newRefreshToken,
          getRefreshTokenCookieOptions(),
        );
      }

      return res
        .status(HttpStatus.OK)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .json({
          message: "Refresh access token successfully",
        });
    },
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;
      if (!sessionId) {
        throw new NotFoundException("Session is invalid.");
      }
      await this.authService.logout(sessionId);
      return clearAuthCookies(res).status(HttpStatus.OK).json({
        message: "User logout successfully",
      });
    },
  );
}
