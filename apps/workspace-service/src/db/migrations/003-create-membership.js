"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("memberships", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "platform_users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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

      status: {
        type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "REMOVED"),
        allowNull: false,
        defaultValue: "ACTIVE",
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

    await queryInterface.addConstraint("memberships", {
      fields: ["userId", "organizationId"],
      type: "unique",
      name: "unique_membership_user_organization",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("memberships");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_memberships_status";',
    );
  },
};