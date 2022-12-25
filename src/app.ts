import dotenv from "dotenv";
import "express-async-errors";
dotenv.config();

import express from "express";
import { Request, Response } from "express";
import connectDB from "./db/connectDB";

import fileUpload from "express-fileupload";
// USE V2
import cloudinary from "cloudinary";
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// import routers
import productRouter from "./routes/productsRoute";
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import orderRouter from "./routes/ordersRoute";

// import middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

// rest packages
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
// import xss from "xss-clean";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
const app = express();

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// express middleware and package

app.use(morgan("tiny"));
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser(process.env.JWT_SECRET));

app.get("/", (req: Request, res: Response) => {
  res.send("<h2>Hello world</h2>");
});

// routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void | undefined> => {
  try {
    console.log("connecting....");
    await connectDB(process.env.MONGO_URL as string);
    app.listen(PORT, () => console.log(`port is listen on port: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

startServer();
