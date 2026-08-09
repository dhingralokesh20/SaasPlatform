"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("otps", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.ENUM(
          "EMAIL_VERIFICATION",
          "FORGOT_PASSWORD",
          "LOGIN_MFA",
          "INVITE",
        ),
        allowNull: false,
      },

      otpHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "ACTIVE",
          "VERIFIED",
          "EXPIRED",
          "FAILED",
          "REVOKED",
          "LOCKED",
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("otps", ["email", "type", "status"]);
    await queryInterface.addIndex("otps", ["userId", "type", "status"]);
    await queryInterface.addIndex("otps", ["expiresAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("otps");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_otps_type";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_otps_status";',
    );
  },
};