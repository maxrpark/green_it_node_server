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
const router = Router();

router.route("/").get(deletedAllUsers);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/confirmation").post(confirmEmail);
router.route("/logout").delete(authenticateUser, logout);
router.route("/forgot-password").post(forgetPassword);
router.route("/reset-password").post(resetPassword);

export = router;
