import {
  AggregateTypes,
  EventTypes,
} from "@worksphere/shared-contracts";
import { OtpStatus, OtpType, OTP_CONFIG } from "../constants/otpConstants";
import { RATE_LIMITS } from "../constants/rateLimitContants";
import { sequelize } from "../db/sequelize";
import { AppError } from "../errors/AppError";
import {
  OtpExpiredError,
  OtpLockedError,
  InvalidOtpError,
  OtpCooldownError,
  OtpActivationFailedError,
} from "../errors/ErrorConfig";
import { redis } from "../redis";
import { otpRepository } from "../repositories/otp.repository";
import { generateNumericOtp, hashOtp, safeCompare } from "../utils/otp.util";
import { otpCooldownKey, OtpKey, rateLimitKey } from "../utils/redisKeys";
import { rateLimitService } from "./rateLimit.service";
import { outboxEventService } from "./outboxEvent.service";

interface GenerateOtpParams {
  email: string;
  type: OtpType;
  metadata?: Record<string, any>;
}

interface RedisOtpPayload {
  otpHash: string;
}

export class OtpService {
  // will think upon this function in future do we actually need it
  // this will be modified once state machines are added
  async validateOtpRequest(params: {
    email: string;
    type: OtpType;
  }): Promise<{ canRequest: boolean; retryAfterSeconds: number }> {
    const cdKey = otpCooldownKey(params.type, params.email);

    const ttl = await redis.ttl(cdKey);

    if (ttl > 0) {
      return { canRequest: false, retryAfterSeconds: ttl };
    }

    return { canRequest: true, retryAfterSeconds: 0 };
  }

  async generateOtp(params: GenerateOtpParams): Promise<{ id: string }> {
    const key = rateLimitKey("otp-generate", params.email);

    const rateLimit = await rateLimitService.consume({
      key,
      limit: RATE_LIMITS.OTP_GENERATE.limit,
      windowSeconds: RATE_LIMITS.OTP_GENERATE.windowSeconds,
    });

    if (!rateLimit.allowed) {
      throw new AppError({
        ...OtpCooldownError,
        data: {
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
      });
    }

    const plainOtp = generateNumericOtp(OTP_CONFIG.LENGTH);
    console.log(plainOtp);
    // Store only hashed OTP, never plaintext OTP
    const otpHash = hashOtp(plainOtp);

    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_SECONDS * 1000);

    const otpRow = await sequelize.transaction(async (t) => {
      const otp = await otpRepository.create(
        {
          email: params.email,
          type: params.type,
          otpHash,
          status: OtpStatus.PENDING,
          expiresAt,
          metadata: params.metadata ?? null,
        },
        { transaction: t },
      );
      await outboxEventService.createEvent(
        {
          eventType: EventTypes.OTP_REQUESTED,
          aggregateType: AggregateTypes.USER,
          aggregateId: otp.id,
          payload: {
            email: params.email,
            otp: plainOtp,
            year: String(new Date().getFullYear()),
          },
        },
        {
          transaction: t,
        },
      );

      return otp;
    });

    // Redis stores active OTP data for fast verification
    const payload: RedisOtpPayload = {
      otpHash,
    };

    try {
      await redis.set(
        OtpKey(params.type, params.email),
        JSON.stringify(payload),
        "EX",
        OTP_CONFIG.EXPIRY_SECONDS,
      );
    } catch (err) {
      await otpRepository
        .updateStatus(otpRow.id, OtpStatus.FAILED)
        .catch(() => {
          // Ignore audit update failure
        });
      throw new AppError(OtpActivationFailedError);
    }

    // OTP becomes active after Redis entry is created
    await otpRepository.updateStatus(otpRow.id, OtpStatus.ACTIVE);

    // Prevent repeated OTP requests
    await redis.set(
      otpCooldownKey(params.type, params.email),
      "1",
      "EX",
      OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
    );

    // TODO: Send OTP through email/SMS service

    return {
      id: otpRow.id,
    };
  }

  // in future wrap this whole operation in single transaction
  async resendOtp(params: GenerateOtpParams): Promise<{ id: string }> {
    const eligibility = await this.validateOtpRequest(params);

    if (!eligibility.canRequest) {
      throw new AppError({
        ...OtpCooldownError,
        data: {
          retryAfterSeconds: eligibility.retryAfterSeconds,
        },
      });
    }

    // Revoke previous active OTP before generating a new one
    const existingOtp = await otpRepository.findActiveByEmailAndType(
      params.email,
      params.type,
    );

    if (existingOtp) {
      await otpRepository.updateStatus(existingOtp.id, OtpStatus.REVOKED);
      await redis.del(OtpKey(params.type, params.email));
    }

    return this.generateOtp(params);
  }

  async verifyOtp(params: {
    email: string;
    type: OtpType;
    otp: string;
  }): Promise<{ verified: true }> {
    const key = OtpKey(params.type, params.email);

    const raw = await redis.get(key);

    if (!raw) {
      throw new AppError(OtpExpiredError);
    }

    const payload: RedisOtpPayload = JSON.parse(raw);

    const providedHash = hashOtp(params.otp);

    // Find OTP record to update lifecycle status
    const otpRecord = await otpRepository.findActiveByEmailAndType(
      params.email,
      params.type,
    );

    if (!otpRecord) {
      throw new AppError(OtpExpiredError);
    }

    if (!safeCompare(providedHash, payload.otpHash)) {
      const attemptsKey = `${key}:attempts`;

      const attempts = await redis.incr(attemptsKey);

      await redis.expire(attemptsKey, OTP_CONFIG.EXPIRY_SECONDS);

      if (attempts >= OTP_CONFIG.MAX_VERIFY_ATTEMPTS) {
        await redis.del(key, attemptsKey);

        await otpRepository.updateStatus(otpRecord.id, OtpStatus.LOCKED, {
          attempts,
        });

        throw new AppError(OtpLockedError);
      }

      throw new AppError(InvalidOtpError);
    }

    // OTP successfully verified, remove temporary Redis data
    await redis.del(key, `${key}:attempts`);

    await otpRepository.updateStatus(otpRecord.id, OtpStatus.VERIFIED, {
      verifiedAt: new Date(),
    });

    return {
      verified: true,
    };
  }
}
