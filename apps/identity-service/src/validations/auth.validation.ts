import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string()
})