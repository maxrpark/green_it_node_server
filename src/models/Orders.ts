import { Schema, Document, model, Types } from "mongoose";
import { SingleItemOrderInf, OrderInterface } from "../ts/interfaces/";

type SingleItemOrderType = SingleItemOrderInf & Document;

const singleItemSchema = new Schema<SingleItemOrderType>({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  product_total: {
    type: Number,
    required: true,
  },
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

type OrderType = OrderInterface & Document;
const OrderSchema = new Schema<OrderType>(
  {
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [singleItemSchema],
    paymentIntentId: {
      type: String,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Order = model<OrderType>("Order", OrderSchema);
export default Order;
