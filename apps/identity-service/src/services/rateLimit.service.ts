import { redis } from "../redis";
import {
  ConsumeRateLimitParams,
  RateLimitResult,
} from "../types/ratelimit.type";

class RateLimiterService {
  async consume(params: ConsumeRateLimitParams): Promise<RateLimitResult> {
    const { key, limit, windowSeconds } = params;

    const currentCount = await redis.incr(key);

    /**
     * First request in the window.
     * Set expiry only once.
     */
    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);

    const remaining = Math.max(limit - currentCount, 0);

    return {
      allowed: currentCount <= limit,
      remaining,
      retryAfterSeconds: ttl > 0 ? ttl : 0,
    };
  }

  async reset(key: string): Promise<void> {
    await redis.del(key);
  }

  async getRetryAfter(key: string): Promise<number> {
    const ttl = await redis.ttl(key);

    return ttl > 0 ? ttl : 0;
  }
  async check(key: string, limit: number): Promise<boolean> {
    const currentCount = await redis.get(key);

    return Number(currentCount || 0) < limit;
  }

  async increment(key: string, windowSeconds: number): Promise<number> {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    return currentCount;
  }
}

export const rateLimitService = new RateLimiterService();
