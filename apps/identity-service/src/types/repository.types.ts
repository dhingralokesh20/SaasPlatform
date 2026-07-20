import { Transaction } from "sequelize";

export interface RepositoryOptions {
  transaction?: Transaction;
}