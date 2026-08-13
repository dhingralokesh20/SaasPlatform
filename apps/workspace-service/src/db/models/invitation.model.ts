import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../sequelize';

export class Invitation extends Model<
  InferAttributes<Invitation>,
  InferCreationAttributes<Invitation>
> {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare email: string;
  declare invitedBy: string;
  declare status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'INVALID';
  declare tokenHash: string;
  declare expiresAt: Date;
  declare acceptedAt: Date | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Invitation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    invitedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'platform_users',
        key: 'userId',
      },
    },

    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'ACCEPTED',
        'DECLINED',
        'EXPIRED',
        'REVOKED',
        'INVALID',
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },

    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    acceptedAt: {
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
    tableName: 'invitations',
    timestamps: true,
  },
);