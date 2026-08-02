export const AggregateTypes = {
  USER: "USER",
  WORKSPACE: "WORKSPACE",
} as const;

export type AggregateType =
  typeof AggregateTypes[keyof typeof AggregateTypes];