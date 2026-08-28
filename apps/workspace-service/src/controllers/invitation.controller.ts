import { Request, Response } from "express";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { InvitationService } from "../services/invitation.service";

const invitationService = new InvitationService();

export class InvitationController {
  async createInvitations(
    req: Request<{ organizationId: string }>,
    res: Response,
  ) {
    const { organizationId } = req.params;
    const { emails } = req.body;

    const invitations = await invitationService.createInvitations({
      organizationId,
      emails,
      invitedBy: req?.organizationMember!.userId,
      invitedByEmail: req.user!.email
    });

    return res.status(HttpSuccessStatusCode.CREATED).json({
      success: true,
      data: invitations,
    });
  }
}
