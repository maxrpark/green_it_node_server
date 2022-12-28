import Stripe from "stripe";
import Order from "../models/Orders";
import Product from "../models/Product";
import { RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors";
import {
  ProductInterface,
  RequestUser,
} from "../ts/interfaces/globalInterfaces";
import { SingleItemOrderInf } from "../ts/interfaces/";
import { checkPermissions } from "../utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-08-01",
});

const getAllOrders: RequestHandler = async (req, res) => {
  const orders = await Order.find({}).sort("-createdAt");

  res.status(StatusCodes.OK).json({ orders: orders, count: orders.length });
};

const stripeSession: RequestHandler = async (req, res) => {
  const { productItems } = req.body;
  if (!productItems) {
    throw new BadRequestError("Please Provide all values");
  }

  let orderItems: SingleItemOrderInf[] = [];
  let subtotal = 0;

  for (const item of productItems as SingleItemOrderInf[]) {
    const dbProduct: ProductInterface | null = await Product.findOne({
      _id: item.product,
    });
    if (!dbProduct) {
      throw new BadRequestError(`No product with id: ${item.product}`);
    } else if (!item.amount) {
      throw new BadRequestError(`Provide amount for item: ${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem: SingleItemOrderInf = {
      name,
      price,
      image,
      amount: item.amount,
      product: _id,
      product_total: item.amount * price,
    };

    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  let total = 0 + subtotal;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  res.status(StatusCodes.OK).json({
    orderItems,
    total,
    subtotal,
    clientSecret: paymentIntent.client_secret,
  });
};

const createOrder = async (req: RequestUser, res: Response) => {
  const { orderItems, total, subtotal, clientSecret } = req.body;
  if (!orderItems) {
    throw new BadRequestError("Please Provide all values");
  }

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    clientSecret,
    status: "paid",
    user: req.user!.userId,
  });

  res.status(StatusCodes.OK).json(order);
};
const getSingleOrder = async (req: RequestUser, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id });

  if (!order) {
    throw new BadRequestError(`No order with id: ${id}`);
  }
  const user = req.user;
  if (user) {
    await checkPermissions(user, order.user);
  }

  res.status(StatusCodes.OK).json(order);
};

const getSingleUserOrders = async (req: RequestUser, res: Response) => {
  const { id } = req.params;
  const orders = await Order.find({ user: id }).sort("-createdAt");

  const reqUser = req.user;
  if (reqUser) {
    await checkPermissions(reqUser, id);
  }

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req: RequestUser, res: Response) => {
  const { id } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: id });

  if (!order) {
    throw new BadRequestError(`No order with id: ${id}`);
  }
  const user = req.user;
  if (user) {
    await checkPermissions(user, order.user);
  }

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json(order);
};

export {
  getAllOrders,
  createOrder,
  getSingleOrder,
  getSingleUserOrders,
  updateOrder,
  stripeSession,
};
