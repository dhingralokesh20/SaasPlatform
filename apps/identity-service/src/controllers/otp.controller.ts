import { Request, Response } from "express";

export class OtpController {
  // Platform Registration
  async generateOtp(req: Request, res: Response) {}

  async resendOtp(req: Request, res: Response) {}

  async valiateOtpRequest(req: Request, res: Response) {}

  async verifyOtp(req: Request, res: Response) {}
}
