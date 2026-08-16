import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";
import { Membership } from "../db/models";

export class MembershipRepository extends BaseRepository<Membership> {
  constructor() {
    super(Membership);
  }

  async createMembership(
    data: {
      userId: string;
      organizationId: string;
      status?: "ACTIVE" | "SUSPENDED" | "REMOVED";
    },
    options?: RepositoryOptions,
  ) {
    return this.create(data, options);
  }
}
