import { InvalidStateTransitionError } from "./errors/InvalidStateTransitionError";
import { IStateMachine } from "./interfaces/IStateMachine";
import { TransitionMap, StateTransition } from "./types/transitionMap";

export class DefaultStateMachine<
  TState extends string,
> implements IStateMachine<TState> {
  constructor(private readonly transitions: TransitionMap<TState>) {}

  canTransition(transition: StateTransition<TState>): boolean {
    const { from, to } = transition;

    return this.transitions[from]?.includes(to) ?? false;
  }

  transition(transition: StateTransition<TState>): TState {
    if (!this.canTransition(transition)) {
      throw new InvalidStateTransitionError(transition.from, transition.to);
    }

    return transition.to;
  }
}
