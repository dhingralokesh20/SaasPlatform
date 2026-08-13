"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("invitations", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      invitedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "platform_users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "ACCEPTED",
          "DECLINED",
          "EXPIRED",
          "REVOKED",
          "INVALID",
        ),
        allowNull: false,
        defaultValue: "PENDING",
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invitations");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_invitations_status";',
    );
  },
};