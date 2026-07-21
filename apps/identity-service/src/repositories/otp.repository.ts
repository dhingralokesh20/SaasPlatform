import { Otp } from "../db/models";
import { BaseRepository } from "./base.repository";
import { OtpStatus, OtpType } from "../constants/otpConstants";
import { RepositoryOptions } from "../types/repository.types";
import { Op } from "sequelize";

export class OtpRepository extends BaseRepository<Otp> {
  constructor() {
    super(Otp);
  }

  async updateStatus(
    id: string,
    status: OtpStatus,
    extra: Partial<{ attempts: number; verifiedAt: Date }> = {},
    options?: RepositoryOptions,
  ) {
    return this.update({ id }, { status, ...extra }, options);
  }

  async findActiveByEmailAndType(
    email: string,
    type: OtpType,
    options?: RepositoryOptions,
  ) {
    return this.findOne({ email, type, status: OtpStatus.ACTIVE }, options);
  }

  async markStaleActiveAsFailed(now: Date = new Date()) {
    return this.model.update(
      { status: OtpStatus.FAILED },
      {
        where: {
          status: OtpStatus.ACTIVE,
          expiresAt: { [Op.lt]: now },
        },
      },
    );
  }

  async deleteOlderThan(cutoffDate: Date) {
    return this.model.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
      },
    });
  }

}

// singleton — one instance is enough since it's stateless
export const otpRepository = new OtpRepository();
