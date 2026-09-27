export const AggregateTypes = {
  USER: "USER",
  WORKSPACE: "WORKSPACE",
  INVITATION: "INVITATION",
} as const;

export type AggregateType =
  typeof AggregateTypes[keyof typeof AggregateTypes];
