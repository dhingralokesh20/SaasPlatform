import { AppError } from "../errors/AppError";
import {
  errorCode,
  ErrorMessage,
  HttpErrorStatusCode,
} from "../errors/ErrorConfig";
import { UserRepository } from "../repositories/user.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

const userRepository = new UserRepository();

export class AuthService {
  registerUser = async (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    // check if user with same email exists
    const existingUser = await userRepository.findUserByEmail(userData.email);

    // if possible modify app error such that i dont need to write message
    // i pass the data as function parameters not as object
    if (existingUser) {
      throw new AppError({
        message: ErrorMessage.USER_ALREADY_EXISTS,
        statusCode: HttpErrorStatusCode.CONFLICT,
        code: errorCode.USER_ALREADY_EXISTS,
      });
    }

    // check if the username is available or not
    const existingUsername = await userRepository.findUserByUsername(
      userData.username,
    );

    if (existingUsername) {
      throw new AppError({
        message: ErrorMessage.USERNAME_ALREADY_TAKEN,
        statusCode: HttpErrorStatusCode.CONFLICT,
        code: errorCode.USERNAME_TAKEN,
      });
    }
    const passwordHash = await hashPassword(userData.password);

    // create user
    const user = await userRepository.create({
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash,
    });

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

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
  };

  login = async (userData: { email: string; password: string }) => {
    const { email, password } = userData;
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      throw new AppError({
        message: ErrorMessage.INVALID_CREDENTIALS,
        statusCode: HttpErrorStatusCode.UNAUTHORIZED,
        code: errorCode.INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError({
        message: ErrorMessage.INVALID_CREDENTIALS,
        statusCode: HttpErrorStatusCode.UNAUTHORIZED,
        code: errorCode.INVALID_CREDENTIALS,
      });
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, email);
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
  };

  generateTokens = (userId: string, email: string) => {
    const accessToken = generateAccessToken({
      userId,
      email,
    });

    const refreshToken = generateRefreshToken({
      userId: userId,
    });

    return { refreshToken, accessToken };
  };

  refreshAccessToken = async (refreshToken: string) => {
    try {
      const decodedToken = verifyRefreshToken(refreshToken) as {
        userId: string;
      };

      const user = await userRepository.findById(decodedToken.userId);
      if (!user) {
        throw new AppError({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: HttpErrorStatusCode.BAD_REQUEST,
          code: errorCode.USER_NOT_FOUND,
        });
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      throw new AppError({
        message: ErrorMessage.UNAUTHORIZED,
        statusCode: HttpErrorStatusCode.UNAUTHORIZED,
        code: errorCode.UNAUTHORIZED,
      });
    }
  };
}
