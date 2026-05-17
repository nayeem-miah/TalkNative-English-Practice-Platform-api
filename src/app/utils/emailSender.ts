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
    console.log("Attempting to send email via Nodemailer (Gmail SMTP - Configured Port)...");
    
    const transporter = nodemailer.createTransport({
      host: config.nodeMiller.email_host || "smtp.gmail.com",
      port: Number(config.nodeMiller.email_port) || 587,
      secure: Number(config.nodeMiller.email_port) === 465, // true for 465, false for 587
      auth: {
        user: config.nodeMiller.email_user,
        pass: config.nodeMiller.email_pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents SSL verification issues on cloud environments
      },
      connectionTimeout: 10000, // 10 seconds timeout to fail fast if port is blocked
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
    console.error("Configured Nodemailer SMTP failed, attempting automatic fallback to Gmail Port 465 (SSL/TLS)... Error details:", error);
    
    // Automatic Fallback to Port 465 (direct SSL/TLS) which is highly reliable on Render
    try {
      console.log("Attempting fallback email sending via Nodemailer Port 465 (SSL/TLS)...");
      const fallbackTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Port 465 uses direct SSL/TLS
        auth: {
          user: config.nodeMiller.email_user,
          pass: config.nodeMiller.email_pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
      });

      const info = await fallbackTransporter.sendMail({
        from: config.nodeMiller.email_from || config.nodeMiller.email_user,
        to: email,
        subject: subject,
        html: html,
      });

      console.log("Message sent successfully via Fallback Nodemailer (Port 465): %s", info.messageId);
      return info;
    } catch (fallbackError) {
      console.error("Fallback Nodemailer Port 465 also failed:", fallbackError);
      throw fallbackError;
    }
  }
};

export default emailSender;
