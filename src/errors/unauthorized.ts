import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api";

class UnauthorizedError extends CustomAPIError {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export = UnauthorizedError;
