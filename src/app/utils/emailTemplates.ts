/**
 * Unified email template helper for TalkNative.
 * Renders consistent, clean, premium HTML layouts for all system emails.
 */

interface BaseTemplateOptions {
  title: string;
  preheader?: string;
  contentHtml: string;
}

const wrapLayout = (options: BaseTemplateOptions): string => {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    body {
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f9;
      padding: 40px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      border: 1px solid #e6e9f0;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
      padding: 35px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
      font-family: "Outfit", "Inter", sans-serif;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
      line-height: 1.6;
      font-size: 16px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .button-container {
      margin: 30px 0;
      text-align: center;
    }
    .button {
      background-color: #4F46E5;
      color: #ffffff !important;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
    }
    .otp-box {
      background-color: #f3f4f6;
      border: 2px dashed #4F46E5;
      border-radius: 8px;
      padding: 15px;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 6px;
      text-align: center;
      color: #1f2937;
      margin: 30px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #f0f2f5;
    }
    .footer p {
      margin: 0 0 8px 0;
      color: #9ca3af;
      font-size: 13px;
    }
    .footer a {
      color: #4F46E5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${options.preheader ? `<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; font-size:0; max-height:0; max-width:0; overflow:hidden;">${options.preheader}</span>` : ""}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>TalkNative</h1>
      </div>
      <div class="content">
        ${options.contentHtml}
      </div>
      <div class="footer">
        <p>&copy; ${year} TalkNative. All rights reserved.</p>
        <p>If you have any questions, contact us at <a href="mailto:support@talknative.com">support@talknative.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generates OTP verification email template
 */
export const getOtpTemplate = (userName: string, code: string): string => {
  return wrapLayout({
    title: "Verify Your Account",
    preheader: "Your 6-digit account verification code.",
    contentHtml: `
      <h2>Hello ${userName},</h2>
      <p>Thank you for choosing <strong>TalkNative</strong>! We are excited to have you join our language practice platform.</p>
      <p>Please use the following 6-digit verification code to complete your registration process:</p>
      <div class="otp-box">${code}</div>
      <p>This code will expire in 5 minutes. If you did not request this code, you can safely ignore this email.</p>
      <p>Best regards,<br/>The TalkNative Team</p>
    `
  });
};

/**
 * Generates Password Reset email template
 */
export const getResetPasswordTemplate = (userName: string, resetLink: string): string => {
  return wrapLayout({
    title: "Reset Your Password",
    preheader: "Use the link to reset your password.",
    contentHtml: `
      <h2>Hello ${userName},</h2>
      <p>We received a request to reset your password for your <strong>TalkNative</strong> account.</p>
      <p>Click the button below to set a new password:</p>
      <div class="button-container">
        <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
      </div>
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>Best regards,<br/>The TalkNative Team</p>
    `
  });
};

/**
 * Generates Course Enrollment Success email template
 */
export const getCourseEnrollmentSuccessTemplate = (userName: string, courseTitle: string, amount: number): string => {
  return wrapLayout({
    title: "Course Enrollment Confirmed",
    preheader: `Success! You are now enrolled in ${courseTitle}.`,
    contentHtml: `
      <h2 style="color: #10B981;">✅ Enrollment Confirmed!</h2>
      <p>Hello ${userName || "Student"},</p>
      <p>Congratulations! You have successfully enrolled in the course: <strong>${courseTitle}</strong>.</p>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb; margin: 25px 0;">
        <h4 style="margin: 0 0 10px 0; color: #374151;">Payment Details</h4>
        <p style="margin: 0 0 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
        <p style="margin: 0;"><strong>Amount Paid:</strong> $${amount.toFixed(2)} USD</p>
      </div>
      <p>You can now log in to the platform and start your lessons immediately. Happy learning!</p>
      <p>Best regards,<br/>The TalkNative Team</p>
    `
  });
};

/**
 * Generates Generic Payment Success email template
 */
export const getPaymentSuccessTemplate = (userName: string, amount: number): string => {
  return wrapLayout({
    title: "Payment Confirmed",
    preheader: "Your payment has been successfully completed.",
    contentHtml: `
      <h2 style="color: #10B981;">✅ Payment Confirmed!</h2>
      <p>Hello ${userName || "User"},</p>
      <p>Your payment of <strong>$${amount.toFixed(2)} USD</strong> has been successfully processed.</p>
      <p>Thank you for your purchase and support!</p>
      <p>Best regards,<br/>The TalkNative Team</p>
    `
  });
};
