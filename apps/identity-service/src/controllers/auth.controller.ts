import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../config/cookie.config";
import { UnauthorizedError } from "../errors/ErrorConfig";
import { AppError } from "../errors/AppError";

const authService = new AuthService();

export class AuthController {
  // Platform Registration
  async register(req: Request, res: Response) {
    const result = await authService.registerUser(req.body);
    res.cookie("accessToken", result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie(
      "refreshToken",
      result.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(HttpSuccessStatusCode.CREATED).json({
      success: true,
      data: result.user,
    });
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    res.cookie("accessToken", result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie(
      "refreshToken",
      result.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result.user,
    });
  }

  async getNewRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(UnauthorizedError);
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.cookie("accessToken", result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
    });
  }

  async logoutCurrentUserSession(req: AuthenticatedRequest, res: Response) {
    const result = await authService.logoutCurrentUserSession(
      req.user!.sessionId,
    );
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async logoutAllDevices(req: AuthenticatedRequest, res: Response) {
    const result = await authService.logoutAllActiveSessions(req.user!.userId);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async getLoggedInUserState(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  }

  async forgetPassword(req: Request, res: Response) {
    const result = await authService.forgetPassword(req.body.email);
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async validateResetPasswordRequest(req: Request, res: Response) {
    const result = await authService.validateResetPasswordRequest(
      req.body.token,
    );
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.password,
    );
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }
}
