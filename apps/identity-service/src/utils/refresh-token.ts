import bcrypt from "bcrypt";

export const hashRefreshToken = (token: string) => {
  return bcrypt.hash(token, 10);
};

export const compareRefreshToken = (token: string, hash: string) => {
  return bcrypt.compare(token, hash);
};
