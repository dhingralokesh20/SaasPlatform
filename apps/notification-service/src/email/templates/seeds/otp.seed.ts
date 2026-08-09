import { EmailTemplate } from "../../../db/models/email-template.model";

export const otpTemplate = {
  name: "otp",

  subject: "Your Worksphere verification code",

  body: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      @media only screen and (max-width: 600px) {
        .email-card {
          width: 100% !important;
          padding: 32px 24px !important;
        }

        .email-wrapper {
          padding: 24px 16px !important;
        }

        .otp-code {
          font-size: 28px !important;
          letter-spacing: 6px !important;
        }
      }
    </style>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f8fafc;"
    >
      <tr>
        <td
          class="email-wrapper"
          align="center"
          style="padding: 48px 24px;"
        >

          <!-- Main Content Card -->
          <table
            class="email-card"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 570px;
              width: 100%;
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
                          0 2px 4px -1px rgba(0, 0, 0, 0.02);
              padding: 48px;
              text-align: left;
            "
          >
            <tr>
              <td>

                <h1
                  style="
                    margin: 0 0 16px 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.3;
                  "
                >
                  Your verification code
                </h1>

                <p
                  style="
                    margin: 0 0 24px 0;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #334155;
                  "
                >
                  Use the verification code below to continue with your
                  Worksphere account.
                </p>

                <!-- OTP Code -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 32px;"
                >
                  <tr>
                    <td align="center">
                      <div
                        class="otp-code"
                        style="
                          display: inline-block;
                          background-color: #f1f5f9;
                          border: 1px solid #e2e8f0;
                          border-radius: 8px;
                          padding: 16px 28px;
                          font-size: 32px;
                          font-weight: 700;
                          letter-spacing: 8px;
                          color: #0f172a;
                          line-height: 1;
                        "
                      >
                        {{otp}}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Expiry Information -->
                <p
                  style="
                    margin: 0 0 24px 0;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #64748b;
                    text-align: center;
                  "
                >
                  This verification code will expire shortly.
                </p>

                <!-- Subtle Divider -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 24px;"
                >
                  <tr>
                    <td
                      style="
                        border-top: 1px solid #e2e8f0;
                        height: 1px;
                        line-height: 1px;
                        font-size: 1px;
                      "
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <!-- Security Disclaimer -->
                <p
                  style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #64748b;
                    font-style: italic;
                  "
                >
                  If you didn't request this verification code, you can safely
                  ignore this email. Never share this code with anyone.
                </p>

              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 570px;
              width: 100%;
              margin-top: 24px;
              text-align: center;
            "
          >
            <tr>
              <td
                style="
                  font-size: 12px;
                  line-height: 1.5;
                  color: #94a3b8;
                "
              >
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
    otp: "string",
    year: "string",
  },

  isActive: true,
};
