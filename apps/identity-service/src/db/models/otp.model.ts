import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../sequelize";
import { OtpStatus, OtpType } from "../../constants/otpConstants";

export class Otp extends Model<
  InferAttributes<Otp>,
  InferCreationAttributes<Otp>
> {
  declare id: CreationOptional<string>;
  declare userId: string | null;
  declare email: string;
  declare type: OtpType;
  declare otpHash: string;
  declare status: CreationOptional<OtpStatus>;
  declare attempts: CreationOptional<number>;
  declare expiresAt: Date;
  declare verifiedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare metadata: CreationOptional<Record<string, any> | null>;
}

Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(...Object.values(OtpType)),
      allowNull: false,
    },

    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(OtpStatus)),
      defaultValue: OtpStatus.PENDING,
    },

    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    verifiedAt: {
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

    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "otps",
    timestamps: true,
    indexes: [
      {
        fields: ["email", "type", "status"],
      },
      {
        fields: ["userId", "type", "status"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  },
);
