import { Op } from "sequelize";
import { User } from "../db/models/user.model";

import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findUserByEmail(email: string) {
    return this.findOne({ email });
  }

  async findUserByUsername(username: string) {
    return this.findOne({ username });
  }

  async saveResetPasswordToken(
    userId: string,
    token: string,
    expiresAt: Date,
    options?: RepositoryOptions,
  ) {
    return this.update(
      {
        id: userId,
      },
      {
        resetTokenHash: token,
        resetTokenExpiresAt: expiresAt,
      },
      options,
    );
  }

  async findUserByResetToken(tokenHash: string) {
    return this.model.findOne({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  async resetPassword(userId: string, passwordHash: string) {
    return this.update(
      { id: userId },
      {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    );
  }
}
