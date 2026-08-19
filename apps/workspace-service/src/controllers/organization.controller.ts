import { Request, Response } from "express";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { OrganizationService } from "../services/organization.service";

type OrganizationParams = {
  organizationId: string;
};

const organizationService = new OrganizationService();

export class OrganizationController {
  async createOrganization(req: Request, res: Response) {
    const idempotencyKey = req.header("Idempotency-Key");

    const organization = await organizationService.createOrganization(
      req.user!.userId,
      req.body,
      idempotencyKey,
    );

    return res.status(HttpSuccessStatusCode.CREATED).json({
      success: true,
      data: organization,
    });
  }

  async getUserOrganizations(req: Request, res: Response) {
    const organizations = await organizationService.getUserOrganizations(
      req.user!.userId,
    );

    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: organizations,
    });
  }

  async getUserOrganization(req: Request<OrganizationParams>, res: Response) {
    const organization = await organizationService.getUserOrganization(
      req.user!.userId,
      req.params.organizationId,
    );

    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: organization,
    });
  }
  async updateOrganization(req: Request, res: Response) {
    const organization = await organizationService.updateOrganization(
      req.user!.userId,
      req.params.organizationId as string,
      req.body,
    );

    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: organization,
    });
  }

  async disableOrganization(req: Request, res: Response) {
    const organization = await organizationService.disableOrganization(
      req.user!.userId,
      req.params.organizationId as string,
    );

    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: organization,
    });
  }
}
