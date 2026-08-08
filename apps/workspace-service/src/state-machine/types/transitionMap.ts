export type TransitionMap<TState extends string> = Record<
  TState,
  readonly TState[]
>;

export interface StateTransition<TState extends string> {
    from: TState;
    to: TState;
}

export interface StateTransitionContext {
  skipAudit?: boolean;
  metadata?: Record<string, unknown>;
}