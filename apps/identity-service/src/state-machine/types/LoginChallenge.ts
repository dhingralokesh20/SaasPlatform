import { LoginState } from "../auth/login/LoginState";

export interface LoginChallenge {
  userId: string;
  email: string;
  state: LoginState;
  rememberMe: boolean;
}