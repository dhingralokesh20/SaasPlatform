import { OtpType } from "../constants/otpConstants";

export const OtpKey = (type: OtpType, identifier: string) => 
    `otp:${type}:${identifier}`;

export const otpCooldownKey = (type: OtpType, identifier: string) =>
  `otp:cooldown:${type}:${identifier}`;
