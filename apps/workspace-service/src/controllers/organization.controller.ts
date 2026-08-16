import { Response, Request } from "express";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { OrganizationService } from "../services/organization.service";

const organizationService = new OrganizationService();

export class OrganizationController {
  async createOrganization(req: Request, res: Response) {
    const idempotencyKey = req.header("Idempotency-Key");
    const organization = await organizationService.createOrganization(
      req.user!.userId,
      req.body,
      idempotencyKey
    );

    return res.status(HttpSuccessStatusCode.CREATED).json({
      success: true,
      data: organization,
    });
  }
}
