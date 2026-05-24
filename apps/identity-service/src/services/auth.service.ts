import { User } from "../db/models/user.model";

export class AuthService {
  async register(data: {
    email: string;
    passwordHash: string;
    username?: string;
  }) {
    const existingUser = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await User.create({
      email: data.email,
      passwordHash: data.passwordHash,
      username: data.username ?? null,
    });

    return user;
  }

  async login(email: string) {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUserById(id: string) {
    return User.findByPk(id);
  }
}