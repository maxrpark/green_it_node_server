import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Error } from "mongoose";
import { MongoError } from "mongodb";
interface customError {
  statusCode: number;
  msg: string;
}
const errorHandlerMiddleware = async (
  error: Error | MongoError | any, // TODO
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError: customError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: error.message || "Something went wrong try again later",
  };

  if (error instanceof Error.ValidationError) {
    customError.msg = error.message;
    customError.statusCode = 400;
  } else if (error instanceof Error.CastError) {
    customError.msg = `No item found with id : ${error?.value}`;
    customError.statusCode = 404;
  } else if ((error as MongoError).code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      error
    )} field, please choose another value`;
    customError.statusCode = 400;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export = errorHandlerMiddleware;
