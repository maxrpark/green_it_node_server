import User from "../models/User";
import { RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RequestUser } from "../ts/interfaces/globalInterfaces";
import {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors";
import createToken from "../utils/jwt/createToken";
import { attachCookiesToResponse, checkPermissions } from "../utils";

const getAllUsers: RequestHandler = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser: RequestHandler = async (
  req: RequestUser,
  res: Response
) => {
  const user = await User.findOne({ _id: req.params.id });
  // .select("-password");
  if (!user) {
    return res.status(StatusCodes.OK).json({ msg: "no user" });
  }

  const reqUser = req.user;
  if (reqUser) {
    await checkPermissions(reqUser, user._id);
  }

  res.status(StatusCodes.OK).json(user);
};

const showCurrentUser = async (req: RequestUser, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req: RequestUser, res: Response) => {
  if (req.user?.role === "supervisor") {
    throw new UnauthorizedError("Supervisor can not edit user details");
  }

  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide all the values");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user?.userId },
    { name, email },
    {
      runValidators: true,
      new: true,
    }
  );

  if (user) {
    const userJWT = createToken(user);
    attachCookiesToResponse({ res, user: userJWT });
    res.status(StatusCodes.OK).json({ user: userJWT });
  }
};

const updatePassword = async (req: RequestUser, res: Response) => {
  if (req.user?.role === "supervisor") {
    throw new UnauthorizedError("Supervisor can not edit user details");
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide all the values");
  }

  const user = await User.findOne({ _id: req.user?.userId });

  if (!user) {
    throw new BadRequestError("No user found");
  } else {
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid Credentials");
    } else {
      user.password = newPassword;
      user.save();
      res.status(StatusCodes.OK).json({ msg: "Password Updated" });
    }
  }
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updatePassword,
};
