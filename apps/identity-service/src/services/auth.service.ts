import { AppError } from "../errors/AppError";
import {
  errorCode,
  ErrorMessage,
  HttpErrorStatusCode,
  InvalidCredentialsError,
  InvalidTokenError,
  UnauthorizedError,
  UserAlreadyExistsError,
  UserNameAlreadyTakenError,
  UserNotFoundError,
} from "../errors/ErrorConfig";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { RefreshTokenPayload } from "../types/session.types";
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

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

export class AuthService {
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
  }) => {
    const transaction = await sequelize.transaction();
    const { email, password, rememberMe = false } = userData;
    try {
      const user = await userRepository.findUserByEmail(email);

      if (!user) {
        throw new AppError(InvalidCredentialsError);
      }

      const isPasswordValid = await comparePassword(
        password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new AppError(InvalidCredentialsError);
      }

      const { accessToken, refreshToken } = await this.generateUserTokens(
        user.id,
        email,
        transaction,
        rememberMe,
      );

      await transaction.commit();
      return {
        user: {
          id: user.id,
          email,
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

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await userRepository.saveResetPasswordToken(
        user.id,
        hashedToken,
        expiresAt,
      );

      const resetUrl = `${envConfig.FRONTEND_URL}/reset-password?token=${rawToken}`;

      // TODO:
      // await emailService.send({
      //   type: EmailType.FORGOT_PASSWORD,
      //   to: user.email,
      //   mappings: {
      //     firstName: user.firstName,
      //     resetLink: resetUrl,
      //   },
      // });

      // if (config.nodeEnv === "development") {
      //   console.log("Password reset URL:", resetUrl);
      // }

      return {
        success: true,
        message: SuccessMessage.RESET_PASSWORD_LINK_GENERATED,
      };
    } catch (error) {
      throw error;
    }
  };

  private async getValidResetPasswordUser(token: string) {
    const hashedToken = hashToken(token);

    const user = await userRepository.findUserByResetToken(hashedToken);

    if (!user) {
      throw new AppError(InvalidTokenError);
    }

    return user;
  }

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

    // TODO:
    // await sessionService.invalidateAllSessions(user.id);

    return {
      success: true,
      message: SuccessMessage.RESET_PASSWORD,
    };
  };
}
