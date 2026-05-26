import { AppError } from "../errors/AppError";
import { UserRepository } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";
import { hashPassword } from "../utils/password";

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
    const existingUser = await userRepository.findByEmail(userData.email);

    // if possible modify app error such that i dont need to write message
    // i pass the data as function parameters not as object
    if (existingUser) {
      throw new AppError({
        message: "User already exists",
        statusCode: 409,
        code: "USER_ALREADY_EXISTS",
      });
    }

    // check if the username is available or not
    const existingUsername = await userRepository.findByUsername(
      userData.username,
    );

    if (existingUsername) {
      throw new AppError({
        message: "Username already taken",
        statusCode: 409,
        code: "USERNAME_ALREADY_EXISTS",
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

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
  },
      accessToken,
    };
  };
}
