import axios from "axios";
import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (subject: string, email: string, html: string) => {
  // If Resend API Key is provided, try sending via Resend first
  if (config.nodeMiller.resend_api_key) {
    try {
      console.log("Attempting to send email via Resend API...");

      // Note: In Resend, if you don't own/verify the domain, you cannot use it in 'from'.
      // If the email_from is set to a Gmail address, we must fallback to 'onboarding@resend.dev' for Resend.
      const isGmailFrom = config.nodeMiller.email_from?.includes("gmail.com");
      const fromAddress = isGmailFrom 
        ? "onboarding@resend.dev" 
        : (config.nodeMiller.email_from || "onboarding@resend.dev");

      const response = await axios.post(
        "https://api.resend.com/emails",
        {
          from: fromAddress,
          to: email,
          subject: subject,
          html: html,
        },
        {
          headers: {
            Authorization: `Bearer ${config.nodeMiller.resend_api_key}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Email sent successfully via Resend:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Resend API failed, falling back to Nodemailer (Gmail SMTP)... Error details:",
        error.response?.data || error.message
      );
      // Fall through to Nodemailer SMTP if Resend fails
    }
  }

  // Fallback / Default: Send via Nodemailer (Gmail SMTP)
  try {
    console.log("Attempting to send email via Nodemailer (Gmail SMTP)...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.nodeMiller.email_user,
        pass: config.nodeMiller.email_pass,
      },
    });

    const info = await transporter.sendMail({
      from: config.nodeMiller.email_from || config.nodeMiller.email_user,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Message sent successfully via Nodemailer: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed via Nodemailer:", error);
    throw error;
  }
};

export default emailSender;
