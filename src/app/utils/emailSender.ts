import nodemailer from "nodemailer";
import config from "../config";


const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.nodeMiller.email_user,
      pass: config.nodeMiller.email_pass
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: config.nodeMiller.email_from,
      to: email,
      subject: `${subject}`,
      html,
    });

    console.log("✅ Email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed for:", email);
    console.error(error);
  }
};

export default emailSender;