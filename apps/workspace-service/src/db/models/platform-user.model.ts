import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../sequelize';

export class PlatformUser extends Model<
  InferAttributes<PlatformUser>,
  InferCreationAttributes<PlatformUser>
> {
  declare userId: string;
  declare email: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare profilePic: string | null;
  declare status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PlatformUser.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    profilePic: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'platform_users',
    timestamps: true,
  },
);