import { z } from "zod";
import { passwordSchema } from "./password.validation";

export const registerSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  rememberMe: z.boolean().optional()
})

export const forgetPasswordSchema = z.object({
  email: z.email(),
})

export const validateResetPasswordSchema = z.object({
  token: z.string()
})

export const resetPasswordSchema = z.object({
  password: z.string(),
  token: z.string()
})

export const verifyMFASchema = z.object({
  challengeId: z.string(),
  otp: z.string(),
})

export const resendMFASchema = z.object({
  challengeId: z.string(),
})