import { Document, Schema, model } from "mongoose";

import { ProductInterface } from "../ts/interfaces/globalInterfaces";

type ProductSchemaType = ProductInterface & Document;

const ProductSchema = new Schema<ProductSchemaType>(
  {
    name: {
      type: String,
      required: [true, "please enter product name"],
      maxlength: [30, "Field can not be more than 200 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    short_desc: {
      type: String,
      required: [true, "please enter short description"],
      maxlength: [200, "Field can not be more than 100 characters"],
    },
    long_description: {
      type: String,
      maxlength: [500, "Field can not be more than 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "please enter provide product price"],
      min: [0, "price can not be lower than 0"],
    },
    category: {
      type: String,
      required: [true, "please enter product category"],
      enum: {
        values: [
          "plants",
          "decoration",
          "tools",
          "care",
          "seeds",
          "pots",
          "more",
        ],
        message: "{VALUE} is not supported",
      },
    },
    type: {
      type: String,
      enum: {
        values: ["indoor", "bushes", "flowers", "trees", "cactus", "outdoor"],
        message: "{VALUE} is not supported",
      },
    },
    stock: {
      type: Number,
      min: [0, "stock can not be lower than 0"],
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text", category: "text", type: "text" });

const Product = model<ProductSchemaType>("Product", ProductSchema);
export default Product;
