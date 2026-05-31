import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../sequelize";
import { User } from "./user.model";

export class Session extends Model<
  InferAttributes<
    Session,
    {
      omit: "createdAt" | "updatedAt";
    }
  >,
  InferCreationAttributes<
    Session,
    {
      omit: "createdAt" | "updatedAt";
    }
  >
> {
  declare id: CreationOptional<string>;

  declare userId: string;

  declare refreshTokenHash: string;

  declare expiresAt: Date;

  declare lastUsedAt: CreationOptional<Date>;

  declare userAgent: string | null;

  declare ipAddress: string | null;

  declare isRevoked: CreationOptional<boolean>;

  declare revokedAt: Date | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    refreshTokenHash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "sessions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["expiresAt"],
      },
      {
        fields: ["isRevoked"],
      },
    ],
  },
);
