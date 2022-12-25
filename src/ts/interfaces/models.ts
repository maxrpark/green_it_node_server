// TODO refactor userInterface user payload

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
  email?: string;
}

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

export interface SingleItemOrderInf {
  _id?: string;
  name: string;
  image: string;
  price: number;
  amount: number;
  product?: string;
  product_total?: number;
}

export interface OrderInterface {
  _id?: string;
  createdAt?: string;
  subtotal: number;
  total: number;
  orderItems: SingleItemOrderInf[];
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  user: UserInterface;
}

export interface TokenInt {
  _id?: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  isValid: boolean;
  user: UserInterface;
}
