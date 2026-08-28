export const HttpErrorStatusCode = {
  BAD_REQUEST: 400,
  INVALID_OPERATION: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
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
  IDEMPOTENCY_KEY_REQUIRED: "Idempotency-Key header is required.",
  IDEMPOTENCY_REQUEST_IN_PROGRESS:
    "A request with this idempotency key is already in progress.",
  ORGANIZATION_NOT_FOUND: "Organization not found.",
  ORGANIZATION_MEMBERSHIP_NOT_FOUND:
    "You are not a member of this organization.",
  INVITATION_VALIDATION_FAILED: "One or more invitations could not be created.",
};

export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",

  ORGANIZATION_SLUG_EXISTS: "ORGANIZATION_SLUG_EXISTS",
  PLATFORM_USER_NOT_FOUND: "PLATFORM_USER_NOT_FOUND",
  PLATFORM_USER_INACTIVE: "PLATFORM_USER_INACTIVE",
  ORGANIZATION_NOT_FOUND: "ORGANIZATION_NOT_FOUND",
  IDEMPOTENCY_KEY_REQUIRED: "IDEMPOTENCY_KEY_REQUIRED",
  IDEMPOTENCY_REQUEST_IN_PROGRESS: "IDEMPOTENCY_REQUEST_IN_PROGRESS",
  ORGANIZATION_MEMBERSHIP_NOT_FOUND: "ORGANIZATION_MEMBERSHIP_NOT_FOUND",
  INVITATION_VALIDATION_FAILED: "INVITATION_VALIDATION_FAILED",
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

export const IdempotencyKeyRequiredError = {
  message: ErrorMessage.IDEMPOTENCY_KEY_REQUIRED,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
  code: ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
};

export const IdempotencyRequestInProgressError = {
  message: ErrorMessage.IDEMPOTENCY_REQUEST_IN_PROGRESS,
  statusCode: HttpErrorStatusCode.CONFLICT,
  code: ErrorCode.IDEMPOTENCY_REQUEST_IN_PROGRESS,
};

export const OrganizationNotFoundError = {
  message: ErrorMessage.ORGANIZATION_NOT_FOUND,
  statusCode: HttpErrorStatusCode.NOT_FOUND,
  code: ErrorCode.ORGANIZATION_NOT_FOUND,
};

export const OrganizationMembershipNotFoundError = {
  message: ErrorMessage.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
  statusCode: HttpErrorStatusCode.FORBIDDEN,
  code: ErrorCode.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
};

export const InvitationValidationFailedError = {
  message: ErrorMessage.INVITATION_VALIDATION_FAILED,
  statusCode: HttpErrorStatusCode.BAD_REQUEST,
  code: ErrorCode.INVITATION_VALIDATION_FAILED,
};