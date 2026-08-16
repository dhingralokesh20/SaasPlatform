export const redisKeys = {
  organizationIdempotency: (
    userId: string,
    idempotencyKey: string,
  ) => `idempotency:organization:${userId}:${idempotencyKey}`,
};