import { z } from "zod";

export const createInvitationSchema = z
  .object({
    emails: z
      .array(z.string().trim())
      .min(1)
      .max(20),
  })
  .strict();