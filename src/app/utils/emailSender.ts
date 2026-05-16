import nodemailer from "nodemailer";
import config from "../config";


const emailSender = async (subject: string, email: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.nodeMiller.email_host || "smtp.gmail.com",
      port: Number(config.nodeMiller.email_port) || 587,
      secure: config.nodeMiller.email_port === '465', // true for 465, false for other ports
      auth: {
        user: config.nodeMiller.email_user,
        pass: config.nodeMiller.email_pass
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: config.nodeMiller.email_from,
      to: email,
      subject: `${subject}`,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

export default emailSender;
