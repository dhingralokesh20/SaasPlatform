import { Op } from "sequelize";

import { Session } from "../db/models/session.model";
import { BaseRepository } from "./base.repository";
import { RepositoryOptions } from "../types/repository.types";

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super(Session);
  }

  async findActiveSession(sessionId: string, options?: RepositoryOptions) {
    return this.findOne(
      {
        id: sessionId,
        isRevoked: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      options,
    );
  }

  async revokeSession(sessionId: string, options?: RepositoryOptions) {
    return this.update(
      {
        id: sessionId,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
      },
      options,
    );
  }

  async updateRefreshTokenHash(
    sessionId: string,
    refreshTokenHash: string,
    options?: RepositoryOptions,
  ) {
    return this.update(
      {
        id: sessionId,
      },
      {
        refreshTokenHash,
      },
      options,
    );
  }

  async updateLastUsedAt(sessionId: string, options?: RepositoryOptions) {
    return this.update(
      {
        id: sessionId,
      },
      {
        lastUsedAt: new Date(),
      },
      options,
    );
  }
  async rotateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    options?: RepositoryOptions,
  ) {
    return this.update(
      {
        id: sessionId,
      },
      {
        refreshTokenHash,
        lastUsedAt: new Date(),
      },
      options,
    );
  }

  async revokeAllSessionsByUserId(userId: string, options?: RepositoryOptions) {
    return this.update(
      {
        userId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
      },
    );
  }

  async deleteExpiredSessions() {
    return this.delete({
      expiresAt: {
        [Op.lt]: new Date(),
      },
    });
  }

  async deleteRevokedSessions() {
    const retentionDate = new Date();

    retentionDate.setDate(retentionDate.getDate() - 30);
    return this.delete({
      isRevoked: true,
      revokedAt: {
        [Op.lt]: retentionDate,
      },
    });
  }
}
