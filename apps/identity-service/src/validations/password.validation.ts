// validators/password.schema.ts

import { z } from 'zod';
import { PASSWORD_POLICY } from '../config/password-policy';

export const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, {
    message: `Password must be at least ${PASSWORD_POLICY.minLength} characters long`,
  })
  .refine(
    (password) =>
      !PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(password),
    {
      message: 'Password must contain at least one uppercase letter',
    },
  )
  .refine(
    (password) =>
      !PASSWORD_POLICY.requireLowercase || /[a-z]/.test(password),
    {
      message: 'Password must contain at least one lowercase letter',
    },
  )
  .refine(
    (password) =>
      !PASSWORD_POLICY.requireNumber || /[0-9]/.test(password),
    {
      message: 'Password must contain at least one number',
    },
  )
  .refine(
    (password) =>
      !PASSWORD_POLICY.requireSpecialCharacter ||
      /[^A-Za-z0-9]/.test(password),
    {
      message: 'Password must contain at least one special character',
    },
  );