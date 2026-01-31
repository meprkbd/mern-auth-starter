import type { ErrorRequestHandler, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "../config/http.config.js";
import { AppError } from "../utils/appError.js";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HttpStatus.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
): any => {
  console.error(`Error occured on PATH: ${req.path}`, error);

  if (error instanceof SyntaxError) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: "Invalid JSON format, please check your request body",
    });
  }

  if (error instanceof z.ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown error occurred",
  });
};
