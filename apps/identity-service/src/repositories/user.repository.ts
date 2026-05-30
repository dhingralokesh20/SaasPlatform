import { User } from "../db/models/user.model";

import { BaseRepository } from "./base.repository";

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
}
