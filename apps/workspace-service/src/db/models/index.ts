import { Organization } from "./organization.model";
import { PlatformUser } from "./platform-user.model";
import { Membership } from "./membership.model";
import { Invitation } from "./invitation.model";
import { OutboxEvent } from "./outboxEvent.model";
// Platform User → Membership
PlatformUser.hasMany(Membership, {
  foreignKey: "userId",
  sourceKey: "userId",
  as: "memberships",
});

Membership.belongsTo(PlatformUser, {
  foreignKey: "userId",
  targetKey: "userId",
  as: "user",
});

// Organization → Membership
Organization.hasMany(Membership, {
  foreignKey: "organizationId",
  sourceKey: "id",
  as: "memberships",
});

Membership.belongsTo(Organization, {
  foreignKey: "organizationId",
  targetKey: "id",
  as: "organization",
});

// Organization → Invitation
Organization.hasMany(Invitation, {
  foreignKey: "organizationId",
  sourceKey: "id",
  as: "invitations",
});

Invitation.belongsTo(Organization, {
  foreignKey: "organizationId",
  targetKey: "id",
  as: "organization",
});

// Membership → Invitation (invitedBy)
Membership.hasMany(Invitation, {
  foreignKey: "invitedBy",
  sourceKey: "id",
  as: "sentInvitations",
});

Invitation.belongsTo(Membership, {
  foreignKey: "invitedBy",
  targetKey: "id",
  as: "inviter",
});

export { Organization, PlatformUser, Membership, Invitation, OutboxEvent };
