import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config.js";
import { HttpStatus } from "./config/http.config.js";
import connectDB from "./database/db.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    message: "Server working fine!",
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(
      `Server listening on port ${config.PORT} in ${config.NODE_ENV} mode.`,
    );
  });
};

startServer().catch((error: Error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
