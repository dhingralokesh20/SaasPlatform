import { z } from "zod";

export const createOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Organization name is required")
      .max(150, "Organization name must not exceed 150 characters"),

    slug: z
      .string()
      .trim()
      .min(1, "Organization slug is required")
      .max(150, "Organization slug must not exceed 150 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),

    description: z
      .string()
      .trim()
      .max(5000, "Description must not exceed 5000 characters")
      .optional(),

    logo: z
      .string()
      .trim()
      .max(500, "Logo URL must not exceed 500 characters")
      .optional(),
  })
  .strict();

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    logo: z.string().trim().optional(),
  })
  .strict();

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
