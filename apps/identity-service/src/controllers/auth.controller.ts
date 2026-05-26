import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { HttpSuccessStatusCode } from "../errors/SuccessConfig";

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

  // async login(req: Request, res: Response) {
  //   const { email } = req.body;

  //   const user = await authService.login(email);

  //   return res.json({
  //     success: true,
  //     user,
  //   });
  // }

  // async getUserById(req: Request, res: Response) {
  //   const userId = '';
  //   const user = await authService.getUserById(userId);

  //   return res.json({
  //     success: true,
  //     user,
  //   });
  // }
}
