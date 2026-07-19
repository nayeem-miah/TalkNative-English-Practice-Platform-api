// Updated config to ensure environment variables are reloaded
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  jwt: {
    accessToken: process.env.JWT_ACCESS_SECRET,
    refreshToken: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_pass_secret: process.env.JWT_RESET_PASS_SECRET,
    reset_pass_token_expires_in: process.env.JWT_RESET_PASS_EXPIRES_IN,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  nodeMiller: {
    email_host: process.env.EMAIL_HOST,
    email_port: process.env.EMAIL_PORT,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    email_from: process.env.EMAIL_FROM,
    resend_api_key: process.env.RESEND_API_KEY,
    brevo_api_key: process.env.BREVO_API_KEY,
  },

  stripe: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebHookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000",
  },


  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  salt_rounds: Number(process.env.SALT_ROUNDS),

  reset_pass_link: process.env.RESET_PASS_LINK,

  client_url: process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000",

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8321/api/v1/auth/google/callback",
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
};
