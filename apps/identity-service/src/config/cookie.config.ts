import { envConfig } from "./env.config";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httOnly: true, 
    secure: envConfig.NODE_ENV === 'production',
    sameSite: "strict" as const,
    maxAge: envConfig.ACCESS_TOKEN_EXPIRY
}

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httOnly: true, 
    secure: envConfig.NODE_ENV === 'production',
    sameSite: "strict" as const,
    maxAge: envConfig.REFRESH_TOKEN_EXPIRY
}
