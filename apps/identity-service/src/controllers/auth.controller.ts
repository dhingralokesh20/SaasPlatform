import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const authService = new AuthService();

export class AuthController {
  // Platform Registration
  async register(req: Request, res: Response) {
    const result = await authService.registerUser(req.body);
    return res.status(HttpSuccessStatusCode.CREATED).json({
      success: true,
      data: result,
    });
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async getNewRefreshToken(req: Request, res: Response) {
    const result = await authService.refreshAccessToken(req.body.token);
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async logoutCurrentUserSession(req: AuthenticatedRequest, res: Response) {
    const result = await authService.logoutCurrentUserSession(
      req.user!.sessionId,
    );
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async logoutAllDevices(req: AuthenticatedRequest, res: Response) {
    const result = await authService.logoutAllActiveSessions(
      req.user!.userId,
    );
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }
  
}
