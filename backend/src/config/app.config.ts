import { getEnv } from "../utils/getEnv.js";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),

  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),
  MONGO_URI: getEnv("MONGO_URI"),
});

export const config = appConfig();
