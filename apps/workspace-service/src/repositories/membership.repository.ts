import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";
import { Membership, Organization } from "../db/models";
import { ASSOCIATIONS } from "../db/association";

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
  async findMembershipsByUserId(userId: string, options?: RepositoryOptions) {
    return this.model.findAll({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: [
        {
          model: Organization,
          as: ASSOCIATIONS.Membership.Organization,
          where: {
            status: "ACTIVE",
          },
          required: true,
        },
      ],
      transaction: options?.transaction,
    });
  }

  async findMembershipByUserAndOrganization(
    userId: string,
    organizationId: string,
    options?: RepositoryOptions,
  ) {
    return this.model.findOne({
      where: {
        userId,
        organizationId,
        status: "ACTIVE",
      },
      include: [
        {
          model: Organization,
          as: ASSOCIATIONS.Membership.Organization,
          where: {
            status: "ACTIVE",
          },
          required: true,
        },
      ],
      transaction: options?.transaction,
    });
  }

  async findMembershipByEmailAndOrganization(
    email: string,
    organizationId: string,
    options?: RepositoryOptions,
  ) {
    return this.model.findOne({
      where: {
        email,
        organizationId,
        status: "ACTIVE",
      },
      transaction: options?.transaction,
    });
  }
}
