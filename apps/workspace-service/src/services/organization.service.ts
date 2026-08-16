import { sequelize } from "../db/sequelize";
import { OrganizationRepository } from "../repositories/organization.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { AppError } from "../errors/AppError";
import { OrganizationSlugExistsError } from "../errors/ErrorConfig";
import { OutboxRepository } from "../repositories/outboxEvent.repository";

export class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private membershipRepository: MembershipRepository;
  private outboxRepository: OutboxRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
    this.membershipRepository = new MembershipRepository();
    this.outboxRepository = new OutboxRepository();
  }

  async createOrganization(
    userId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
      logo?: string;
    },
  ) {
    const existingOrganization =
      await this.organizationRepository.findOrganizationBySlug(data.slug);

    if (existingOrganization) {
      throw new AppError(OrganizationSlugExistsError);
    }

    return sequelize.transaction(async (transaction) => {
      const organization = await this.organizationRepository.createOrganization(
        {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          logo: data.logo ?? null,
        },
        { transaction },
      );

      const membership = await this.membershipRepository.createMembership(
        {
          userId,
          organizationId: organization.id,
          status: "ACTIVE",
        },
        { transaction },
      );

      await this.outboxRepository.createEvent(
        {
          eventType: "organization.created",
          aggregateType: "organization",
          aggregateId: organization.id,
          payload: {
            organizationId: organization.id,
            name: organization.name,
            slug: organization.slug,
            createdBy: userId,
          },
        },
        { transaction },
      );
      return {
        organization,
        membership,
      };
    });
  }
}
