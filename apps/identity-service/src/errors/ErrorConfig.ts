export const HttpErrorStatusCode = {
  BAD_REQUEST: 400,
  INVALID_OPERATION: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  GONE: 410,
  TOO_MANY_REQUESTS: 429,
  LOCKED: 423,
};

export const ErrorMessage = {
  SOMETHING_WENT_WRONG: "Something went wrong, please try again.",
  INVALID_CREDENTIALS: "Invalid user or password, Please try again.",
  UNAUTHORIZED: "Please login to access the resource.",
  USER_ALREADY_EXISTS:
    "User with same email is already registered, Please try a different email.",
  USERNAME_ALREADY_TAKEN:
    "User with same username is already registered, Please try a different username.",
  USER_NOT_FOUND: "User does not exists.",
  TOKEN_INVALID: "The token is expired or invalid. Kindly recheck the details.",

  OTP_NOT_FOUND: "OTP not found.",
  OTP_EXPIRED: "OTP has expired. Please request a new OTP.",
  INVALID_OTP: "Invalid OTP. Please try again.",
  OTP_LOCKED: "Too many failed attempts. OTP has been locked.",
  OTP_COOLDOWN: "Please wait before requesting another OTP.",
  OTP_ACTIVATION_FAILED: "Failed to activate OTP. Please try again.",
  LOGIN_CHALLENGE_EXPIRED: "Login Challenge has expired, kindly retry.",
  LOGIN_CHALLENGE_INVALID: "Invalid login challenge. Please login again.",
  LOGIN_CHALLENGE_INVALID_STATE:
    "Login challenge is no longer valid. Please restart the login process.",
};

export const errorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  TOKEN_INVALID: "TOKEN_INVALID",

  OTP_NOT_FOUND: "OTP_NOT_FOUND",
  OTP_EXPIRED: "OTP_EXPIRED",
  INVALID_OTP: "INVALID_OTP",
  OTP_LOCKED: "OTP_LOCKED",
  OTP_COOLDOWN: "OTP_COOLDOWN",
  OTP_ACTIVATION_FAILED: "OTP_ACTIVATION_FAILED",
  LOGIN_CHALLENGE_EXPIRED: "LOGIN_CHALLENGE_EXPIRED",
  LOGIN_CHALLENGE_INVALID: "LOGIN_CHALLENGE_INVALID",
  LOGIN_CHALLENGE_INVALID_STATE: "LOGIN_CHALLENGE_INVALID_STATE",
};

export const UnauthorizedError = {
  message: ErrorMessage.UNAUTHORIZED,
  statusCode: HttpErrorStatusCode.UNAUTHORIZED,
  code: errorCode.UNAUTHORIZED,
};

export const UserNotFoundError = {
  message: ErrorMessage.USER_NOT_FOUND,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
  code: errorCode.USER_NOT_FOUND,
};

export const InvalidCredentialsError = {
  message: ErrorMessage.INVALID_CREDENTIALS,
  statusCode: HttpErrorStatusCode.UNAUTHORIZED,
  code: errorCode.INVALID_CREDENTIALS,
};

export const UserAlreadyExistsError = {
  message: ErrorMessage.USER_ALREADY_EXISTS,
  statusCode: HttpErrorStatusCode.CONFLICT,
  code: errorCode.USER_ALREADY_EXISTS,
};

export const UserNameAlreadyTakenError = {
  message: ErrorMessage.USERNAME_ALREADY_TAKEN,
  statusCode: HttpErrorStatusCode.CONFLICT,
  code: errorCode.USERNAME_TAKEN,
};

export const InvalidTokenError = {
  message: ErrorMessage.TOKEN_INVALID,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
  code: errorCode.TOKEN_INVALID,
};

export const InvalidOtpError = {
  code: errorCode.INVALID_OTP,
  message: ErrorMessage.INVALID_OTP,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
};

export const OtpLockedError = {
  code: errorCode.OTP_LOCKED,
  message: ErrorMessage.OTP_LOCKED,
  statusCode: HttpErrorStatusCode.LOCKED,
};

export const OtpExpiredError = {
  code: errorCode.OTP_EXPIRED,
  message: ErrorMessage.OTP_EXPIRED,
  statusCode: HttpErrorStatusCode.GONE,
};

export const OtpCooldownError = {
  code: errorCode.OTP_COOLDOWN,
  message: ErrorMessage.OTP_COOLDOWN,
  statusCode: HttpErrorStatusCode.TOO_MANY_REQUESTS,
};

export const OtpActivationFailedError = {
  code: errorCode.OTP_ACTIVATION_FAILED,
  message: ErrorMessage.OTP_ACTIVATION_FAILED,
  statusCode: HttpErrorStatusCode.INVALID_OPERATION,
};

export const LoginChallengeExpiredError = {
  code: errorCode.LOGIN_CHALLENGE_EXPIRED,
  message: ErrorMessage.LOGIN_CHALLENGE_EXPIRED,
  statusCode: HttpErrorStatusCode.UNAUTHORIZED,
};

export const InvalidChallengeError = {
  code: errorCode.LOGIN_CHALLENGE_INVALID,
  message: ErrorMessage.LOGIN_CHALLENGE_INVALID,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
};

export const InvalidChallengeStateError = {
  code: errorCode.LOGIN_CHALLENGE_INVALID_STATE,
  message: ErrorMessage.LOGIN_CHALLENGE_INVALID_STATE,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
};
