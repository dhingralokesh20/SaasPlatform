import { EmailTemplate } from "../../../db/models/email-template.model";

export const passwordResetTemplate = {
  name: "password-reset",

  subject: "Reset your password",

  body: `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Reset your password</title>
        <style>
          @media only screen and (max-width: 600px) {
            .email-card {
              width: 100% !important;
              padding: 32px 24px !important;
            }
            .email-wrapper {
              padding: 24px 16px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; width: 100%; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 48px 24px; width: 100%;">
          <tr>
            <td align="center">
              <!-- Logo Header -->
              <table width="100%" max-width="570" cellpadding="0" cellspacing="0" border="0" style="max-width: 570px; width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
                    Worksphere
                  </td>
                </tr>
              </table>

              <!-- Main Content Card -->
              <table class="email-card" width="100%" max-width="570" cellpadding="0" cellspacing="0" border="0" style="max-width: 570px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02); padding: 48px; text-align: left;">
                <tr>
                  <td>
                    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                      Reset your password
                    </h1>
                    
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                      You requested a password reset for your Worksphere account.
                    </p>
                    
                    <!-- Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td align="center">
                          <a href="{{resetUrl}}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15); border: 1px solid #4f46e5;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Subtle Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link Section -->
                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                      If you are having trouble with the button above, copy and paste the URL below into your web browser:
                    </p>
                    <p style="margin: 0 0 28px 0; font-size: 13px; line-height: 1.5; color: #4f46e5; word-break: break-all;">
                      <a href="{{resetUrl}}" target="_blank" style="color: #4f46e5; text-decoration: underline;">Change Password</a>
                    </p>
                    
                    <!-- Security Disclaimer -->
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; font-style: italic;">
                      If you didn't request this password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" max-width="570" cellpadding="0" cellspacing="0" border="0" style="max-width: 570px; width: 100%; margin-top: 24px; text-align: center;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #94a3b8;">
                    &copy; {{year}} Worksphere. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
  `,

  variables: {
    resetUrl: "string",
    year:"string"
  },

  isActive: true,
};
