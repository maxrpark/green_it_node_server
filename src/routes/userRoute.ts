import express from "express";
import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updatePassword,
} from "../controllers/userController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication";

const router = express.Router();

router
  .route("/all-users")
  .get(
    [authenticateUser, authorizePermissions("admin", "supervisor")],
    getAllUsers
  );
router.route("/show-me").get(authenticateUser, showCurrentUser);
router.route("/update-user").post(authenticateUser, updateUser);
router.route("/update-user-password").post(authenticateUser, updatePassword);
router
  .route("/:id")
  .get(
    [authenticateUser, authorizePermissions("admin", "supervisor")],
    getSingleUser
  );

export default router;
