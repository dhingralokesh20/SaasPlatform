import { AppError } from "../errors/AppError";
import {
  InvalidChallengeError,
  InvalidChallengeStateError,
  InvalidCredentialsError,
  InvalidTokenError,
  RateLimitExceededError,
  UnauthorizedError,
  UserAlreadyExistsError,
  UserNameAlreadyTakenError,
  UserNotFoundError,
} from "../errors/ErrorConfig";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { RefreshTokenPayload } from "../types/session.types";
import { LoginResponse, LoginSuccessResponse } from "../types/auth.types";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { envConfig } from "../config/env.config";
import { compareRefreshToken, hashRefreshToken } from "../utils/refresh-token";
import { sequelize } from "../db/sequelize";
import { Transaction } from "sequelize";
import { SuccessMessage } from "../errors/SuccessConfig";
import { generateResetToken, hashToken } from "../utils/crypto";
import { LoginStateMachine } from "../state-machine/auth/login/LoginStateMachine";
import { LoginState } from "../state-machine/auth/login/LoginState";
import { authConfig } from "../config/auth.config";
import { LoginChallengeService } from "../state-machine/auth/login/loginChallengeService";
import { OtpService } from "./otp.service";
import { OtpType } from "../constants/otpConstants";
import { User } from "../db/models";
import { RATE_LIMITS } from "../constants/rateLimitContants";
import { rateLimitKey } from "../utils/redisKeys";
import { rateLimitService } from "./rateLimit.service";
import { outboxEventService } from "./outboxEvent.service";
const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
import {
  EventTypes,
  PasswordResetRequestedPayload,
  AggregateTypes
} from "@worksphere/shared-contracts";

export class AuthService {
  private readonly loginStateMachine = new LoginStateMachine();
  private readonly loginStateChallengeService = new LoginChallengeService();
  private readonly otpService = new OtpService();

  private async completeAuthentication(
    user: User,
    rememberMe: boolean,
  ): Promise<LoginSuccessResponse> {
    const transaction = await sequelize.transaction();

    try {
      const { accessToken, refreshToken } = await this.generateUserTokens(
        user.id,
        user.email,
        transaction,
        rememberMe,
      );

      await transaction.commit();

      return {
        requiresMfa: false,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private rotateRefreshToken = async (
    userId: string,
    email: string,
    sessionId: string,
    transaction?: Transaction,
  ) => {
    const accessToken = generateAccessToken({
      userId,
      email,
      sessionId,
    });

    const refreshToken = generateRefreshToken({
      userId,
      sessionId,
    });

    const refreshTokenHash = await hashRefreshToken(refreshToken);

    await sessionRepository.rotateRefreshToken(sessionId, refreshTokenHash, {
      transaction,
    });

    return {
      accessToken,
      refreshToken,
    };
  };

  private async getValidResetPasswordUser(token: string) {
    const hashedToken = hashToken(token);

    const user = await userRepository.findUserByResetToken(hashedToken);

    if (!user) {
      throw new AppError(InvalidTokenError);
    }

    return user;
  }

  private async checkLoginRateLimit(email: string) {
    const result = await rateLimitService.consume({
      key: rateLimitKey("login", email),
      limit: RATE_LIMITS.LOGIN.limit,
      windowSeconds: RATE_LIMITS.LOGIN.windowSeconds,
    });

    if (!result.allowed) {
      throw new AppError({
        ...RateLimitExceededError,
        data: {
          retryAfterSeconds: result.retryAfterSeconds,
        },
      });
    }
  }

  registerUser = async (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    const transaction = await sequelize.transaction();

    try {
      // check if user with same email exists
      const existingUser = await userRepository.findUserByEmail(userData.email);

      // if possible modify app error such that i dont need to write message
      // i pass the data as function parameters not as object
      if (existingUser) {
        throw new AppError(UserAlreadyExistsError);
      }

      // check if the username is available or not
      const existingUsername = await userRepository.findUserByUsername(
        userData.username,
      );

      if (existingUsername) {
        throw new AppError(UserNameAlreadyTakenError);
      }
      const passwordHash = await hashPassword(userData.password);

      // create user
      const user = await userRepository.create(
        {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          passwordHash,
        },
        { transaction },
      );

      const { accessToken, refreshToken } = await this.generateUserTokens(
        user.id,
        user.email,
        transaction,
      );

      await transaction.commit();
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  login = async (userData: {
    email: string;
    password: string;
    rememberMe: boolean;
  }): Promise<LoginResponse> => {
    const { email, password, rememberMe = false } = userData;

    const loginRateLimitKey = rateLimitKey("login", email);
    const canAttempt = await rateLimitService.check(
      loginRateLimitKey,
      RATE_LIMITS.LOGIN.limit,
    );

    if (!canAttempt) {
      throw new AppError(RateLimitExceededError);
    }

    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      await rateLimitService.increment(
        loginRateLimitKey,
        RATE_LIMITS.LOGIN.windowSeconds,
      );

      throw new AppError(InvalidCredentialsError);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await rateLimitService.increment(
        loginRateLimitKey,
        RATE_LIMITS.LOGIN.windowSeconds,
      );

      throw new AppError(InvalidCredentialsError);
    }

    await rateLimitService.reset(loginRateLimitKey);

    const nextState = this.loginStateMachine.transition({
      from: LoginState.PASSWORD_VERIFIED,
      to: authConfig.mfaEnabled
        ? LoginState.MFA_PENDING
        : LoginState.AUTHENTICATED,
    });

    if (nextState === LoginState.MFA_PENDING) {
      const challenge = await this.loginStateChallengeService.create({
        userId: user.id,
        email: user.email,
        rememberMe,
        state: nextState,
      });
      try {
        await this.otpService.generateOtp({
          email: user.email,
          type: OtpType.LOGIN_MFA,
        });

        return {
          requiresMfa: true,
          challengeId: challenge.challengeId,
        };
      } catch (error) {
        await this.loginStateChallengeService.delete(challenge.challengeId);

        throw error;
      }
    }

    return this.completeAuthentication(user, rememberMe);
  };

  generateUserTokens = async (
    userId: string,
    email: string,
    transaction?: Transaction,
    rememberMe: boolean = false,
  ) => {
    const expiryTime = rememberMe
      ? envConfig.REFRESH_TOKEN_EXPIRY_REMEMBER_ME
      : envConfig.REFRESH_TOKEN_EXPIRY;
    // generate session
    const session = await sessionRepository.create(
      {
        userId: userId,
        refreshTokenHash: "",
        expiresAt: new Date(Date.now() + expiryTime),
        userAgent: null,
        ipAddress: null,
      },
      { transaction },
    );

    const { accessToken, refreshToken } = this.generateTokens(
      userId,
      email,
      session.id,
    );
    const refreshTokenHash = await hashRefreshToken(refreshToken);

    await sessionRepository.updateRefreshTokenHash(
      session.id,
      refreshTokenHash,
      { transaction },
    );

    return { accessToken, refreshToken };
  };

  generateTokens = (userId: string, email: string, sessionId: string) => {
    const accessToken = generateAccessToken({
      userId,
      email,
      sessionId,
    });

    const refreshToken = generateRefreshToken({
      userId: userId,
      sessionId,
    });

    return { refreshToken, accessToken };
  };

  refreshAccessToken = async (refreshToken: string) => {
    let decodedToken: RefreshTokenPayload;

    try {
      decodedToken = verifyRefreshToken(refreshToken) as RefreshTokenPayload;
    } catch {
      throw new AppError(UnauthorizedError);
    }

    const transaction = await sequelize.transaction();

    try {
      const session = await sessionRepository.findActiveSession(
        decodedToken.sessionId,
        { transaction },
      );

      if (!session) {
        throw new AppError(UnauthorizedError);
      }

      const isValidRefreshToken = await compareRefreshToken(
        refreshToken,
        session.refreshTokenHash,
      );

      if (!isValidRefreshToken) {
        await sessionRepository.revokeSession(session.id, { transaction });

        throw new AppError(UnauthorizedError);
      }

      const user = await userRepository.findById(decodedToken.userId, {
        transaction,
      });

      if (!user) {
        throw new AppError(UserNotFoundError);
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.rotateRefreshToken(
          user.id,
          user.email,
          session.id,
          transaction,
        );

      await transaction.commit();

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }

      throw error;
    }
  };

  logoutCurrentUserSession = async (sessionId: string) => {
    const session = await sessionRepository.findActiveSession(sessionId);

    if (!session) throw new AppError(UnauthorizedError);

    await sessionRepository.revokeSession(sessionId);
    return { message: SuccessMessage.LOGOUT_SUCCESS };
  };

  logoutAllActiveSessions = async (userId: string) => {
    await sessionRepository.revokeAllSessionsByUserId(userId);
    return { message: SuccessMessage.LOGOUT_ALL_DEVICES_SUCCESS };
  };

  forgetPassword = async (email: string) => {
    try {
      const forgotPasswordKey = rateLimitKey("forgot-password", email);

      const canRequest = await rateLimitService.check(
        forgotPasswordKey,
        RATE_LIMITS.FORGOT_PASSWORD.limit,
      );

      if (!canRequest) {
        throw new AppError({
          ...RateLimitExceededError,
          data: {
            retryAfterSeconds:
              await rateLimitService.getRetryAfter(forgotPasswordKey),
          },
        });
      }
      const user = await userRepository.findUserByEmail(email);
      // Prevent email enumeration
      if (!user) {
        return {
          success: true,
          message: SuccessMessage.RESET_PASSWORD_LINK_GENERATED,
        };
      }

      const rawToken = generateResetToken();
      const hashedToken = hashToken(rawToken);
      const resetUrl = `${envConfig.FRONTEND_URL}/reset-password?token=${rawToken}`;

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await sequelize.transaction(async (transaction) => {
        await userRepository.saveResetPasswordToken(
          user.id,
          hashedToken,
          expiresAt,
          {
            transaction,
          },
        );

        const payload: PasswordResetRequestedPayload = {
          email: user.email,
          resetUrl,
          year: String(new Date().getFullYear())

        };
        await outboxEventService.createEvent(
          {
            eventType: EventTypes.PASSWORD_RESET_REQUESTED,
            aggregateType: AggregateTypes.USER,
            aggregateId: user.id,
            payload,
          },
          {
            transaction,
          },
        );
      });
      await rateLimitService.increment(
        forgotPasswordKey,
        RATE_LIMITS.FORGOT_PASSWORD.windowSeconds,
      );

      return {
        success: true,
        message: SuccessMessage.RESET_PASSWORD_LINK_GENERATED,
      };
    } catch (error) {
      throw error;
    }
  };

  validateResetPasswordRequest = async (token: string) => {
    await this.getValidResetPasswordUser(token);

    return {
      success: true,
      message: SuccessMessage.RESET_PASSWORD_TOKEN_VALID,
    };
  };

  resetPassword = async (token: string, password: string) => {
    const user = await this.getValidResetPasswordUser(token);

    const passwordHash = await hashPassword(password);

    await userRepository.resetPassword(user.id, passwordHash);

    await sessionRepository.revokeAllSessionsByUserId(user.id);

    return {
      success: true,
      message: SuccessMessage.RESET_PASSWORD,
    };
  };

  verifyMFA = async (data: { challengeId: string; otp: string }) => {
    const { challengeId, otp } = data;

    const challenge = await this.loginStateChallengeService.get(challengeId);

    const rateLimit = await rateLimitService.consume({
      key: rateLimitKey("mfa-verify", challenge.email),
      limit: RATE_LIMITS.MFA_VERIFY.limit,
      windowSeconds: RATE_LIMITS.MFA_VERIFY.windowSeconds,
    });

    if (!rateLimit.allowed) {
      throw new AppError({
        ...RateLimitExceededError,
        data: {
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
      });
    }
    await this.otpService.verifyOtp({
      email: challenge.email,
      type: OtpType.LOGIN_MFA,
      otp,
    });

    this.loginStateMachine.transition({
      from: challenge.state,
      to: LoginState.AUTHENTICATED,
    });

    const user = await userRepository.findById(challenge.userId);

    if (!user) {
      throw new AppError(UserNotFoundError);
    }

    const result = await this.completeAuthentication(
      user,
      challenge.rememberMe,
    );

    await this.loginStateChallengeService.delete(challengeId);

    return result;
  };

  resendMFA = async (challengeId: string) => {
    const challenge = await this.loginStateChallengeService.get(challengeId);

    if (!challenge) {
      throw new AppError(InvalidChallengeError);
    }

    if (challenge.state !== LoginState.MFA_PENDING) {
      throw new AppError(InvalidChallengeStateError);
    }

    await this.otpService.resendOtp({
      email: challenge.email,
      type: OtpType.LOGIN_MFA,
    });

    return {
      message: "OTP sent successfully",
    };
  };
}
