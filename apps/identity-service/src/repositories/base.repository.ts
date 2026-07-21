import { Model, ModelStatic, Transaction, WhereOptions } from "sequelize";
import { RepositoryOptions } from "../types/repository.types";

export class BaseRepository<T extends Model> {
  constructor(protected model: ModelStatic<T>) {}

  async findById(id: string, options?: RepositoryOptions) {
    return this.model.findByPk(id, {
      transaction: options?.transaction as Transaction,
    });
  }

  async findAll(whereClause: WhereOptions, options?: RepositoryOptions) {
    return this.model.findAll({
      where: whereClause,
      transaction: options?.transaction as Transaction,
    });
  }

  async findOne(whereClause: WhereOptions, options?: RepositoryOptions) {
    return this.model.findOne({
      where: whereClause,
      transaction: options?.transaction as Transaction,
    });
  }

  async create(data: any, options?: RepositoryOptions) {
    return this.model.create(data, {
      transaction: options?.transaction as Transaction,
    });
  }

  async update(
    whereClause: WhereOptions,
    data: any,
    options?: RepositoryOptions,
  ) {
    return this.model.update(data, {
      where: whereClause,
      transaction: options?.transaction as Transaction,
    });
  }

  async delete(whereClause: WhereOptions, options?: RepositoryOptions) {
    return this.model.destroy({
      where: whereClause,
      transaction: options?.transaction as Transaction,
    });
  }
  async increment(
    field: string,
    where: WhereOptions<T>,
    options?: RepositoryOptions,
  ) {
    return this.model.increment(field, {
      where,
      transaction: options?.transaction,
    });
  }
}
