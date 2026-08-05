import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../sequelize";
import { EmailStatus, EmailType } from "../../constants/emailConstants";

export class Email extends Model<
  InferAttributes<Email>,
  InferCreationAttributes<Email>
> {
  declare id: CreationOptional<string>;

  declare type: EmailType;
  declare to: string;
  declare subject: string | null;

  declare status: CreationOptional<EmailStatus>;

  declare payload: object; // template mappings
  declare attachments: object | null;

  declare providerMessageId: string | null;

  declare attempts: CreationOptional<number>;
  declare lastError: string | null;

  declare sentAt: Date | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Email.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM(...Object.values(EmailType)),
      allowNull: false,
    },

    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(EmailStatus)),
      defaultValue: EmailStatus.PENDING,
    },

    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    providerMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "emails",
    timestamps: true,
  },
);
