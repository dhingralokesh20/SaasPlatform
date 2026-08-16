"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("outbox_events", {
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
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.ENUM(
          "PENDING",
          "PROCESSING",
          "COMPLETED",
          "FAILED",
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.dropTable("outbox_events");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_outbox_events_status";',
    );
  },
};