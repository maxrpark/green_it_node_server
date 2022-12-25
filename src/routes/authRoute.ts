import { Router } from "express";
import { authenticateUser } from "../middleware/authentication";
import {
  register,
  deletedAllUsers,
  login,
  confirmEmail,
  logout,
  forgetPassword,
  resetPassword,
} from "../controllers/authController";
import rateLimiter from "express-rate-limit";

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
const router = Router();

router.route("/").get(deletedAllUsers);
router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, login);
router.route("/confirmation").post(confirmEmail);
router.route("/logout").delete(authenticateUser, logout);
router.route("/forgot-password").post(forgetPassword);
router.route("/reset-password").post(resetPassword);

export = router;
