export const HttpErrorStatusCode = {
  BAD_REQUEST: 400,
  INVALID_OPERATION: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
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
};

export const errorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
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
