import { OtpType } from "../constants/otpConstants";

export const OtpKey = (type: OtpType, identifier: string) => 
    `otp:${type}:${identifier}`;

export const otpCooldownKey = (type: OtpType, identifier: string) =>
  `otp:cooldown:${type}:${identifier}`;

export const LoginChallengeKey = (
  challengeId: string,
) => `login:challenge:${challengeId}`;

export const rateLimitKey = (
  category: string,
  identifier: string,
): string => {
  return `rate-limit:${category}:${identifier}`;
};