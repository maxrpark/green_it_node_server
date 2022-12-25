import path from "path";
import fs from "fs";
import cloudinary from "cloudinary";
import { RequestHandler } from "express";
import Product from "../models/Product";
import { ProductInterface } from "../ts/interfaces/globalInterfaces";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors";
import { BadRequestError } from "../errors";

interface queryObjet {
  category?: string;
  type?: string;
  featured?: boolean;
  name?: string;
  sort?: string;
  fields?: string;
}

const getAllProducts: RequestHandler = async (req, res) => {
  const {
    category,
    type: productType,
    featured,
    name,
    sort,
    fields,
  }: queryObjet = req.query;

  const queryObjet: queryObjet = {};
  if (category && category !== "all") {
    queryObjet.category = <string>category;
  }
  if (productType && productType !== "all") {
    queryObjet.type = <string>productType;
  }
  if (featured) {
    queryObjet.featured = <string | boolean>featured === "true" ? true : false;
  }
  if (name) {
    queryObjet.name = <any>{ $regex: name, $options: "i" };
  }

  let productsResult = Product.find(queryObjet);

  if (sort) {
    const sortList = sort.split(",").join(" ");
    productsResult = productsResult.sort(sortList);
  } else {
    productsResult = productsResult.sort("_id");
  }
  if (fields) {
    const selectedFields = fields.split(",").join(" ");
    productsResult = productsResult.select(selectedFields);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;

  const skip = (page - 1) * limit;

  productsResult = productsResult.skip(skip).limit(limit);

  const products = await productsResult;

  const totalProducts = await Product.countDocuments(queryObjet);
  const numberOfPages = Math.ceil(totalProducts / limit);

  res.status(StatusCodes.OK).json({ products, totalProducts, numberOfPages });
};

const searchProduct: RequestHandler = async (req, res) => {
  const { query } = req.query;

  const products = await Product.find({ $text: { $search: query as string } });

  res.status(StatusCodes.OK).json({ products });
};
const featuredProducts: RequestHandler = async (req, res) => {
  const products = await Product.find({ featured: true });

  const plants = products.filter((p) => p.category === "plants");
  const decoration = products.filter((p) => p.category === "decoration");
  const tools = products.filter((p) => p.category === "tools");
  const care = products.filter((p) => p.category === "care");
  const seeds = products.filter((p) => p.category === "seeds");
  const pots = products.filter((p) => p.category === "pots");
  const more = products.filter((p) => p.category === "more");
  const productsList = [
    { id: 1, name: "plants", products: plants },
    { id: 2, name: "decoration", products: decoration },
    { id: 3, name: "tools", products: tools },
    { id: 4, name: "care", products: care },
    { id: 5, name: "seeds", products: seeds },
    { id: 6, name: "pots", products: pots },
    { id: 7, name: "more", products: more },
  ];

  res.status(StatusCodes.OK).json(productsList);
};

const createProduct: RequestHandler = async (req, res) => {
  const product: ProductInterface = await Product.create({
    ...req.body,
  });
  res.status(StatusCodes.CREATED).json({ product });
};

const getSingleProduct: RequestHandler = async (req, res) => {
  const product: ProductInterface | null = await Product.findOne({
    _id: req.params.id,
  });

  if (!product) {
    throw new NotFoundError(`No product with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json(product);
};

const updateProduct: RequestHandler = async (req, res) => {
  const {
    name,
    image,
    short_desc,
    long_description,
    price,
    type,
    category,
    stock,
    available,
    featured,
  } = req.body;

  const product: ProductInterface | null = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
      name,
      image,
      short_desc,
      long_description,
      price,
      type,
      category,
      stock,
      available,
      featured,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product) {
    throw new NotFoundError(`No product with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json(product);
};

const deleteProduct: RequestHandler = async (req, res) => {
  const product: ProductInterface | null = await Product.findOneAndDelete({
    _id: req.params.id,
  });
  if (!product) {
    throw new NotFoundError(`No product with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ msg: "product deleted" });
};

const uploadProductImage: RequestHandler = async (req, res) => {
  if (!(<any>req).files) {
    throw new BadRequestError("No file uploaded");
  }
  let productImg = (<any>req).files.image;

  if (!productImg.mimetype.startsWith("image")) {
    throw new BadRequestError(
      "The file you are trying to upload is not and image"
    );
  }
  const maxSize = 1024 * 1024;
  if (productImg.size > maxSize) {
    throw new BadRequestError(
      "The image exceed the size limit, 1024 * 1024, please upload smaller image"
    );
  }

  const result = await cloudinary.v2.uploader.upload(
    (<any>req).files.image.tempFilePath,
    {
      user_filename: true,
      folder: "green_it",
    }
  );
  fs.unlinkSync((<any>req).files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

const deletePreviousImage: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const data = await cloudinary.v2.uploader.destroy(`green_it/${id}`, {
    resource_type: "image",
  });

  res.status(StatusCodes.OK).json(data);
};

export {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  featuredProducts,
  deletePreviousImage,
  searchProduct,
};
