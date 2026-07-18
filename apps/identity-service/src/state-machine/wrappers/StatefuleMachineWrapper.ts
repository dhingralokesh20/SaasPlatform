import { IStateMachine } from "../interfaces/IStateMachine";
import { StateTransition, StateTransitionContext } from "../types/transitionMap";


export class StateMachineWrapper<TState extends string> {

  constructor(
    private readonly machine: IStateMachine<TState>,
  ) {}


  transition(
    transition: StateTransition<TState>,
    context?: StateTransitionContext,
  ): TState {

    const nextState =
      this.machine.transition(transition);


    if (!context?.skipAudit) {
      // Future:
      // Audit event publishing
      // await auditService.log(...)
    }


    return nextState;
  }


  canTransition(
    transition: StateTransition<TState>,
  ): boolean {

    return this.machine.canTransition(transition);

  }

}