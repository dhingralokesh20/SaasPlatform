import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";
import { Invitation } from "../db/models";

export class InvitationRepository extends BaseRepository<Invitation> {
  constructor() {
    super(Invitation);
  }

  async createInvitation(
    data: {
      organizationId: string;
      email: string;
      invitedBy: string;
      tokenHash: string;
      expiresAt: Date;
    },
    options?: RepositoryOptions,
  ) {
    return this.create(
      {
        organizationId: data.organizationId,
        email: data.email,
        invitedBy: data.invitedBy,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        status: "PENDING",
      },
      options,
    );
  }

  async findPendingInvitation(
    organizationId: string,
    email: string,
    options?: RepositoryOptions,
  ) {
    return this.model.findOne({
      where: {
        organizationId,
        email,
        status: "PENDING",
      },
      transaction: options?.transaction,
    });
  }
}

export const invitationRepository = new InvitationRepository();
