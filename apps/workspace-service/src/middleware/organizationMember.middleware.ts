import { Response, NextFunction, Request } from "express";
import { MembershipRepository } from "../repositories/membership.repository";
import { AppError } from "../errors/AppError";
import { OrganizationMembershipNotFoundError } from "../errors/ErrorConfig";

const membershipRepository = new MembershipRepository();
export const OrganizationMemberMiddleware = async (
  req: Request<{ organizationId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { organizationId } = req.params;
    const userId = req?.user?.userId || "";

    const membership =
      await membershipRepository.findMembershipByUserAndOrganization(
        userId,
        organizationId,
      );

    if (!membership) {
      throw new AppError(OrganizationMembershipNotFoundError);
    }

    req.organizationMember = {
      userId: membership.userId,
      organizationId: membership.organizationId,
      status: membership.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};
