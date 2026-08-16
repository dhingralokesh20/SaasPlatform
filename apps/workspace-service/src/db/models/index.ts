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

// Platform User → Invitation (invitedBy)
PlatformUser.hasMany(Invitation, {
  foreignKey: "invitedBy",
  sourceKey: "userId",
  as: "sentInvitations",
});

Invitation.belongsTo(PlatformUser, {
  foreignKey: "invitedBy",
  targetKey: "userId",
  as: "inviter",
});

export { Organization, PlatformUser, Membership, Invitation, OutboxEvent };
