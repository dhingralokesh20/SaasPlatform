import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Model,
} from "sequelize";

import { sequelize } from "../sequelize";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;

  declare email: string;
  declare username: string | null;
  declare passwordHash: string;

  declare firstName: string | null;
  declare lastName: string | null;

  declare emailVerified: CreationOptional<boolean>;

  declare status: CreationOptional<"ACTIVE" | "INACTIVE" | "SUSPENDED">;

  declare resetTokenHash: string | null;
  declare resetTokenExpiresAt: Date | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    passwordHash: {
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

    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      defaultValue: "ACTIVE",
    },

    resetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);
