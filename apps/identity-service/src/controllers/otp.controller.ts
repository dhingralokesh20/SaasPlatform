import { Request, Response } from "express";
import { OtpService } from "../services/otp.service";

const otpService = new OtpService();
export class OtpController {
  // Platform Registration
  async generateOtp(req: Request, res: Response) {
    try {
      const { email, type, metadata } = req.body;

      const result = await otpService.generateOtp({
        email,
        type,
        metadata,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: err.message ?? "Failed to generate OTP",
      });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email, type, metadata } = req.body;

      const result = await otpService.resendOtp({ email, type, metadata });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: err.message ?? "Failed to resend OTP",
      });
    }
  }

  async validateOtpRequest(req: Request, res: Response) {
    try {
      const { email, type } = req.body;

      const result = await otpService.validateOtpRequest({ email, type });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: err.message ?? "Failed to validate OTP request",
      });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, type, otp } = req.body;

      const result = await otpService.verifyOtp({ email, type, otp });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const statusCode = err.statusCode ?? 500;
      return res.status(statusCode).json({
        success: false,
        message: err.message ?? "Failed to verify OTP",
      });
    }
  }
}
