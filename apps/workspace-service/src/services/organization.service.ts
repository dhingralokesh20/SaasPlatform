import { sequelize } from "../db/sequelize";
import { OrganizationRepository } from "../repositories/organization.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { AppError } from "../errors/AppError";
import {
  IdempotencyKeyRequiredError,
  IdempotencyRequestInProgressError,
  OrganizationSlugExistsError,
} from "../errors/ErrorConfig";
import { OutboxRepository } from "../repositories/outboxEvent.repository";
import { IdempotencyService } from "./idempotency.service";

export class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private membershipRepository: MembershipRepository;
  private outboxRepository: OutboxRepository;
  private idempotencyService: IdempotencyService;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
    this.membershipRepository = new MembershipRepository();
    this.outboxRepository = new OutboxRepository();
    this.idempotencyService = new IdempotencyService();
  }

  async createOrganization(
    userId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
      logo?: string;
    },
    idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new AppError(IdempotencyKeyRequiredError);
    }
    const idempotencyResult = await this.idempotencyService.acquire(
      userId,
      idempotencyKey,
    );

    if (idempotencyResult === "PROCESSING") {
      throw new AppError(IdempotencyRequestInProgressError);
    }

    if (idempotencyResult !== "ACQUIRED") {
      return idempotencyResult.response;
    }

    try {
      const existingOrganization =
        await this.organizationRepository.findOrganizationBySlug(data.slug);

      if (existingOrganization) {
        throw new AppError(OrganizationSlugExistsError);
      }


      const result = await sequelize.transaction(async (transaction) => {
        const organization =
          await this.organizationRepository.createOrganization(
            {
              name: data.name,
              slug: data.slug,
              description: data.description ?? null,
              logo: data.logo ?? null,
            },
            { transaction },
          );

        const membership =
          await this.membershipRepository.createMembership(
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

      await this.idempotencyService.markCompleted(
        userId,
        idempotencyKey,
        result,
      );

      return result;
    } catch (error) {
      await this.idempotencyService.markFailed(
        userId,
        idempotencyKey,
        error instanceof Error ? error.message : "Unknown error",
      );

      throw error;
    }
  }
}