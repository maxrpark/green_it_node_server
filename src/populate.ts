"use strict";

require("dotenv").config();
import connectDB from "./db/connectDB";
import Product from "./models/Product";
const jsonProducts = require("../products/products.json"); // get error with import

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL as string);
        await Product.deleteMany();
        await Product.create(jsonProducts);
        console.log("success");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
start();
