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
}
