import { StateTransition } from "../types/transitionMap";

export interface IStateMachine<TState extends string> {

  canTransition(
    transition: StateTransition<TState>,
  ): boolean;


  transition(
    transition: StateTransition<TState>,
  ): TState;

}