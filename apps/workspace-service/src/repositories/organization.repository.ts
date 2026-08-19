import { Organization } from "../db/models/organization.model";
import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super(Organization);
  }

  async findOrganizationBySlug(slug: string, options?: RepositoryOptions) {
    return this.findOne({ slug }, options);
  }

  async createOrganization(
    data: {
      name: string;
      slug: string;
      description?: string | null;
      logo?: string | null;
    },
    options?: RepositoryOptions,
  ) {
    return this.create(data, options);
  }
  async updateOrganization(
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      logo?: string;
    },
    options?: RepositoryOptions,
  ) {
    await this.update({ id: organizationId }, data, options);

    return this.findById(organizationId, options);
  }
  async disableOrganization(
    organizationId: string,
    options?: RepositoryOptions,
  ) {
    await this.update({ id: organizationId }, { status: "DISABLED" }, options);

    return this.findById(organizationId, options);
  }
}
