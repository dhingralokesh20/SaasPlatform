import { TransitionMap } from "../../types/transitionMap";
import { LoginState } from "./LoginState";


export const LOGIN_TRANSITIONS = {

  [LoginState.PASSWORD_VERIFIED]: [
    LoginState.AUTHENTICATED,
    LoginState.MFA_PENDING,
  ],


  [LoginState.MFA_PENDING]: [
    LoginState.AUTHENTICATED,
  ],


  [LoginState.AUTHENTICATED]: [],

} satisfies TransitionMap<LoginState>;