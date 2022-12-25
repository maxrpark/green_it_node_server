import { Request, Response, NextFunction } from "express";
import { isTokenValid, attachCookiesToResponse } from "../utils";
import { UnauthenticatedError, UnauthorizedError } from "../errors";
import Token from "../models/Token";
import { JwtPayload } from "jsonwebtoken";
import { RequestUser } from "../ts/interfaces/globalInterfaces";

const authenticateUser = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = (payload as JwtPayload).user;
      return next();
    }

    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: (payload as JwtPayload).user.userId,
      refreshToken: (payload as JwtPayload).refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new UnauthenticatedError("Authentication Invalid");
    }

    attachCookiesToResponse({
      res,
      user: (payload as JwtPayload).user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = (payload as JwtPayload).user;
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles: string[]) => {
  return (req: RequestUser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      throw new UnauthorizedError("Only administrator can perform this tasks.");
    }
    next();
  };
};
export { authenticateUser, authorizePermissions };
