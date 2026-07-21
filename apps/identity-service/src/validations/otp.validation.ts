import { z } from "zod";
import { OTP_CONFIG, OtpType } from "../constants/otpConstants";

const otpTypeEnum = z.enum(Object.values(OtpType) as [string, ...string[]]);

export const generateOtpSchema = z.object({
  email: z.email(),
  type: otpTypeEnum,
  metadata: z.record(z.string(), z.any()).optional(),
});

export const resendOtpSchema = z.object({
  email: z.email(),
  type: otpTypeEnum,
  metadata: z.record(z.string(), z.any()).optional(),
});

export const validateOtpRequestSchema = z.object({
  email: z.email(),
  type: otpTypeEnum,
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  type: otpTypeEnum,
  otp: z.string().length(OTP_CONFIG.LENGTH),
});