import mongoose, { Document, Schema, model } from "mongoose";
import { UserInterface } from "../ts/interfaces/globalInterfaces";
import { TokenInt } from "../ts/interfaces/models";

type TokenSchemaType = TokenInt & Document;

const TokenSchema = new Schema<TokenSchemaType>(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Token = model<TokenSchemaType>("Token", TokenSchema);
export default Token;
