import { Router } from "express";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication";

import {
  getAllOrders,
  createOrder,
  getSingleOrder,
  getSingleUserOrders,
  updateOrder,
  stripeSession,
} from "../controllers/ordersController";

const router = Router();

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(
    authenticateUser,
    authorizePermissions("admin", "supervisor"),
    getAllOrders
  );

router
  .route("/single-order/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);
router.route("/user-orders/:id").get(authenticateUser, getSingleUserOrders);
router.route("/stripe-session").post(authenticateUser, stripeSession);

export default router;
