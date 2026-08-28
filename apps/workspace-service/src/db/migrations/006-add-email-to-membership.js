"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("memberships", "email", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    // Backfill email for existing memberships.
    await queryInterface.sequelize.query(`
      UPDATE memberships m
      SET email = p.email
      FROM platform_users p
      WHERE m."userId" = p."userId";
    `);

    // Email is required for all memberships going forward.
    await queryInterface.changeColumn("memberships", "email", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    // Optimize email + organization membership lookups.
    await queryInterface.addIndex("memberships", {
      fields: ["organizationId", "email"],
      name: "idx_memberships_organization_email",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "memberships",
      "idx_memberships_organization_email",
    );

    await queryInterface.removeColumn(
      "memberships",
      "email",
    );
  },
};