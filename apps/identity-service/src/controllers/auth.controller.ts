import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, username } = req.body;

    // NOTE: hashing will come next step
    const user = await authService.register({
      email,
      passwordHash: password,
      username,
    });

    return res.json({
      success: true,
      user,
    });
  }

  async login(req: Request, res: Response) {
    const { email } = req.body;

    const user = await authService.login(email);

    return res.json({
      success: true,
      user,
    });
  }

  async getUserById(req: Request, res: Response) {
    const userId = '';
    const user = await authService.getUserById(userId);

    return res.json({
      success: true,
      user,
    });
  }
}