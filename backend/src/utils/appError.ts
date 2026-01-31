import { HttpStatus, type HttpStatusCode } from "../config/http.config.js";
import type { ErrorCode } from "../enums/errorCode.js";

export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public errorCode?: ErrorCode | undefined;

  constructor(
    message: string,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
