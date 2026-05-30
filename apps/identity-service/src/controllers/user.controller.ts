import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const userService = new UserService();

export class UserController {
  // Get Current User
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    return res.status(HttpSuccessStatusCode.SUCCESS).json({
      success: true,
      data: req.user,
    });
  }
}
