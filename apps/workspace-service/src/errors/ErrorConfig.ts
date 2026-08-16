export const HttpErrorStatusCode = {
  BAD_REQUEST: 400,
  INVALID_OPERATION: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND:404,
  GONE: 410,
  TOO_MANY_REQUESTS: 429,
  LOCKED: 423,
};

export const ErrorMessage = {
  SOMETHING_WENT_WRONG: "Something went wrong, please try again.",
  UNAUTHORIZED: "Please login to access the resource.",

  ORGANIZATION_SLUG_EXISTS: "Organization slug already exists.",
  PLATFORM_USER_NOT_FOUND: "Platform user not found.",
  PLATFORM_USER_INACTIVE: "Platform user is not active.",
};

export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",

  ORGANIZATION_SLUG_EXISTS: "ORGANIZATION_SLUG_EXISTS",
  PLATFORM_USER_NOT_FOUND: "PLATFORM_USER_NOT_FOUND",
  PLATFORM_USER_INACTIVE: "PLATFORM_USER_INACTIVE",
};

export const UnauthorizedError = {
  message: ErrorMessage.UNAUTHORIZED,
  statusCode: HttpErrorStatusCode.UNAUTHORIZED,
  code: ErrorCode.UNAUTHORIZED,
};

export const OrganizationSlugExistsError = {
  message: ErrorMessage.ORGANIZATION_SLUG_EXISTS,
  statusCode: HttpErrorStatusCode.CONFLICT,
  code: ErrorCode.ORGANIZATION_SLUG_EXISTS,
};

export const PlatformUserNotFoundError = {
  message: ErrorMessage.PLATFORM_USER_NOT_FOUND,
  statusCode: HttpErrorStatusCode.NOT_FOUND,
  code: ErrorCode.PLATFORM_USER_NOT_FOUND,
};

export const PlatformUserInactiveError = {
  message: ErrorMessage.PLATFORM_USER_INACTIVE,
  statusCode: HttpErrorStatusCode.FORBIDDEN,
  code: ErrorCode.PLATFORM_USER_INACTIVE,
};