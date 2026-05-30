import { AppError } from "../errors/AppError";
import {
  errorCode,
  ErrorMessage,
  HttpErrorStatusCode,
} from "../errors/ErrorConfig";
import { UserRepository } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";

const userRepository = new UserRepository();

export class UserService {
}
