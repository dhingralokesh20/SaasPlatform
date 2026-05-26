import { Model, ModelStatic, WhereOptions } from "sequelize";

export class BaseRepository<T extends Model> {
  constructor(protected model: ModelStatic<T>) {}

  async findById(id: string) {
    return this.model.findByPk(id);
  }

  async findOne(whereClause: WhereOptions) {
    return this.model.findOne({
      where: whereClause,
    });
  }

  async create(data: any) {
    return this.model.create(data);
  }

  async update(whereClause: WhereOptions, data: any) {
    return this.model.update(data, {
      where: whereClause,
    });
  }

  async delete(whereClause: WhereOptions) {
    return this.model.destroy({
      where: whereClause,
    });
  }
}
