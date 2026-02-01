import { getEnv } from "../utils/getEnv.js";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),

  BASE_API_PATH: getEnv("BASE_API_PATH", "/api/v1"),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),
  MONGO_URI: getEnv("MONGO_URI"),

  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  MAILER_SENDER: getEnv("MAILER_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
});

export const config = appConfig();
