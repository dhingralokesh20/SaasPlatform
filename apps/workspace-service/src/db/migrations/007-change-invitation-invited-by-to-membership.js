"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint(
      "invitations",
      "invitations_invitedBy_fkey",
    );

    await queryInterface.addConstraint("invitations", {
      fields: ["invitedBy"],
      type: "foreign key",
      name: "invitations_invitedBy_fkey",
      references: {
        table: "memberships",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "invitations",
      "invitations_invitedBy_fkey",
    );

    await queryInterface.addConstraint("invitations", {
      fields: ["invitedBy"],
      type: "foreign key",
      name: "invitations_invitedBy_fkey",
      references: {
        table: "platform_users",
        field: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};
