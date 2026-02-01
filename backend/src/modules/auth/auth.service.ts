import { config } from "../../config/app.config.js";
import SessionModel from "../../database/models/session.model.js";
import UserModel from "../../database/models/user.model.js";
import VerificationCodeModel from "../../database/models/verification.model.js";
import { ErrorCode } from "../../enums/errorCode.js";
import { VerificationEnum } from "../../enums/verificationCode.enum.js";
import type { LoginDto, RegisterDto } from "../../interfaces/auth.interface.js";
import { sendEmail } from "../../mailers/mailer.js";
import { verifyEmailTemplate } from "../../mailers/templates/template.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../utils/catchErrors.js";
import {
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
} from "../../utils/dateTime.js";
import {
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
  type RefreshTPayload,
} from "../../utils/jwt.js";
import { logger } from "../../utils/logger.js";

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;

    const existingUser = await UserModel.exists({
      email,
    });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      );
    }
    const newUser = await UserModel.create({
      name,
      email,
      password,
    });

    const userId = newUser._id;

    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link
    const verificationUrl = `${config.CLIENT_URL}/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    return {
      user: newUser,
    };
  }

  public async verifyEmail(code: string) {
    const validCode = await VerificationCodeModel.findOne({
      code: code,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR,
      );
    }

    await validCode.deleteOne();
    return {
      user: updatedUser,
    };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    logger.info(`Login attempt for email: ${email}`);
    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      logger.warn(`Login failed: User with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    logger.info(`Creating session for user ID: ${user._id}`);
    const session = await SessionModel.create({
      userId: user._id,
      userAgent: userAgent || "unknown",
    });

    logger.info(`Signing tokens for user ID: ${user._id}`);
    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions,
    );

    logger.info(`Login successful for user ID: ${user._id}`);
    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN,
      );
      await session.save();
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken(
          {
            sessionId: session._id,
          },
          refreshTokenSignOptions,
        )
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async logout(sessionId: string) {
    return await SessionModel.findByIdAndDelete(sessionId);
  }
}
