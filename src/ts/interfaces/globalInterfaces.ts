import { Request } from "express";

export interface ProductInterface {
  _id?: string;
  name: string;
  image: string;
  short_desc: string;
  long_description: string;
  price: number;
  stock: number;
  type: string;
  category: string;
  available: boolean;
  featured: boolean;
}

export interface ProductListInt {
  id: number;
  name: number;
  products: ProductInterface[];
}

export interface UserInterface {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  verificationToken: string;
  isVerified: boolean;
  passwordToken: string;
  passwordTokenExpirationDate: Date;
  verified: number;
  comparePassword: (candidatePassword: string) => string;
}

export interface UserPayload {
  name: string;
  userId: string;
  role: string;
}

export interface RequestUser extends Request {
  user?: UserPayload;
}

// export interface SingleItemOrderInf {
//   _id?: string;
//   name: string;
//   image: string;
//   price: number;
//   amount: number;
//   product: string;
//   product_total: number;
// }
