import { PlatformUser } from "../db/models/platform-user.model";
import { BaseRepository } from "./base.repository";

export class PlatformUserRepository extends BaseRepository<PlatformUser> {
  constructor() {
    super(PlatformUser);
  }

  async findPlatformUserById(userId: string) {
    return this.findOne({ userId });
  }
}