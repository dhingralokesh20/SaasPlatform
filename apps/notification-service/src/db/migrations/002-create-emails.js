"use strict";

const { DataTypes } = require("sequelize");

const EMAIL_TYPES = [
  // Replace with your actual EmailType values
  "OTP",
  "PASSWORD_RESET",
];

const EMAIL_STATUSES = [
  // Replace with your actual EmailStatus values
  "PENDING",
  "PROCESSING",
  "SENT",
  "FAILED",
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("emails", {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },

      type: {
        type: DataTypes.ENUM(...EMAIL_TYPES),
        allowNull: false,
      },

      template: {
        type: DataTypes.STRING,
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
        type: DataTypes.ENUM(...EMAIL_STATUSES),
        allowNull: false,
        defaultValue: "PENDING",
      },

      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
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
        allowNull: false,
        defaultValue: 0,
      },

      lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      processedAt: {
        type: DataTypes.DATE,
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("emails");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_emails_type";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_emails_status";',
    );
  },
};