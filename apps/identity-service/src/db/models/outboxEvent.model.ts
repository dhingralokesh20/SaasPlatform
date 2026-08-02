import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Model,
} from "sequelize";

import { sequelize } from "../sequelize";

export type OutboxStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export class OutboxEvent extends Model<
  InferAttributes<OutboxEvent>,
  InferCreationAttributes<OutboxEvent>
> {
  declare id: CreationOptional<string>;

  declare eventType: string;

  declare aggregateType: string;
  declare aggregateId: string | null;
  declare eventId: CreationOptional<string>;

  declare payload: Record<string, any>;

  declare status: CreationOptional<OutboxStatus>;

  declare retryCount: CreationOptional<number>;

  declare lastError: string | null;

  declare processedAt: Date | null;

  declare version: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OutboxEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    eventId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    aggregateType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    aggregateId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "PROCESSING", "COMPLETED", "FAILED"),
      defaultValue: "PENDING",
      allowNull: false,
    },

    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
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
    tableName: "outbox_events",
    timestamps: true,
  },
);
