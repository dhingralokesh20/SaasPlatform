import { DefaultStateMachine } from "../../DefaultStateMachine";
import { LoginState } from "./LoginState";
import { LOGIN_TRANSITIONS } from "./LoginTransistionMap";


export class LoginStateMachine 
  extends DefaultStateMachine<LoginState>
{

  constructor(){
    super(LOGIN_TRANSITIONS);
  }

}