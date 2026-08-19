export const ASSOCIATIONS = {
  Membership: {
    Organization: "organization",
    User: "user",
  },

  Organization: {
    Membership: "memberships",
    Invitation: "invitations",
  },

  PlatformUser: {
    Memberships: "memberships",
    Invitations: "sentInvitations",
  },

  Invitation: {
    Organization: "organization",
    Inviter: "inviter",
  },
} as const;