import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  MFA_ENABLED: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  RESET_PASSWORD_TOKEN_SECRET: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  ACCESS_TOKEN_EXPIRY: z.coerce.number(),
  REFRESH_TOKEN_EXPIRY: z.coerce.number(),
  REFRESH_TOKEN_EXPIRY_REMEMBER_ME: z.coerce.number(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const envConfig = parsedEnv.data;
