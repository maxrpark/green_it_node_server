import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

import Product from "../build/models/Product";
import connectDB from "../build/db/connectDB";

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    await Product.deleteMany();
    const jsonProducts = JSON.parse(
      await readFileSync("./populate.json", "utf8")
    ); // add the file path and the encoding type
    // const jsonProducts = JSON.parse(
    //   await readFile(new URL("./populate.json", import.meta.url))
    // );

    await Product.create(jsonProducts);
    console.log("success");
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

start();
