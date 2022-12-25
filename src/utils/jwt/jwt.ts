import jwt from "jsonwebtoken";
import { Response } from "express";

interface attachCookiesToResponseParams {
  res: Response;
  user: any; // TODO bring interface
  refreshToken?: string;
}

interface JWT {
  payload: {
    refreshToken?: string;
    user: any;
  };
}

export const createJWT = ({ payload }: JWT) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string);
};

export const isTokenValid = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET as string);

export const attachCookiesToResponse = ({
  res,
  user,
  refreshToken,
}: attachCookiesToResponseParams) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = oneDay * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};
