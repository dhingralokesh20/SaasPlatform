
export interface LoginSuccessResponse {
  requiresMfa: false;
  user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginMfaResponse {
  requiresMfa: true;
  challengeId: string;
}

export type LoginResponse =
  | LoginSuccessResponse
  | LoginMfaResponse;