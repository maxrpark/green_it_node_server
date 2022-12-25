import { RequestHandler } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { StatusCodes } from "http-status-codes";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  createToken,
  attachCookiesToResponse,
  createHash,
} from "../utils";
import { TokenInt } from "../ts/interfaces/models";
import { RequestUser } from "../ts/interfaces/globalInterfaces";
import { BadRequestError, UnauthenticatedError } from "../errors";
import crypto from "crypto";

const deletedAllUsers: RequestHandler = async (req, res) => {
  await User.deleteMany();
  res.status(StatusCodes.OK).json({ msg: "all deleted" });
};

const register: RequestHandler = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new BadRequestError("Email already exists");
  }

  const role = (await User.countDocuments({})) === 0 ? "admin" : "user";
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken,
  });

  const origin = "https://green-it-server.onrender.com";

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
  });
};

const confirmEmail: RequestHandler = async (req, res) => {
  const { verificationToken, email } = req.body;
  // TODO user interface
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Verification Failed, no user");
  } else if (user.isVerified === true && user.verificationToken) {
    return res.status(StatusCodes.OK).json({ msg: "User already verified" });
  } else if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Verification Failed, not same token");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || email.trim() === 0 || password.trim() === 0) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError(
      "Invalid Credentials, please check all the values are correct"
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError(
      "Invalid Credentials, please check all the values are correct"
    );
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError(
      "Please, first verify your email to access your profile."
    );
  }

  const tokenUser = createToken(user);
  let refreshToken = "";

  const existingToken: TokenInt | null = await Token.findOne({
    user: user._id,
  });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return res.status(StatusCodes.OK).json({ user: tokenUser });
  }

  refreshToken = crypto.randomBytes(40).toString("hex");

  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout: RequestHandler = async (req, res) => {
  await Token.findOneAndDelete({ user: (<RequestUser>req).user!.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "logged out" });
};

const forgetPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });
  if (user) {
    const verificationToken = crypto.randomBytes(70).toString("hex");
    const origin = "https://green-it-server.onrender.com";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      origin,
      verificationToken,
    });
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(verificationToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;

    await user.save();
  }
  res.status(StatusCodes.OK).json({ msg: "please check your email" });
};

const resetPassword: RequestHandler = async (req, res) => {
  const { email, password, token } = req.body;
  if (!email || !password || !token) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  } else {
    const currentData = new Date();
    if (
      user.passwordToken === createHash(token) &&
      currentData < user.passwordTokenExpirationDate
    ) {
      user.password = password;
      user.passwordToken = "";
      await user.save();
      return res.status(StatusCodes.OK).json({ msg: "password reset" });
    } else {
      throw new UnauthenticatedError("Invalid Credentials");
    }
  }
};

export {
  register,
  deletedAllUsers,
  login,
  confirmEmail,
  logout,
  forgetPassword,
  resetPassword,
};
