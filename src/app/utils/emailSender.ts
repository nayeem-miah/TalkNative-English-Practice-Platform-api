import nodemailer from "nodemailer";
import config from "../config";


const emailSender = async (subject: string, email: string, html: string) => {
  const { email_host, email_port, email_user, email_pass, email_from } = config.nodeMiller;
  const port = Number(email_port) || 465;

  if (!email_user || !email_pass || !email_from) {
    throw new Error("Email configuration is missing. Please set EMAIL_USER, EMAIL_PASS, and EMAIL_FROM.");
  }

  const transporter = nodemailer.createTransport({
    host: email_host || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: email_user,
      pass: email_pass
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: email_from,
    to: email,
    subject: `${subject}`,
    html,
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
