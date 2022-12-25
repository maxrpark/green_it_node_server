import { Document, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

interface UserInterface extends Document {
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
  comparePassword: (canditatePassword: string) => string;
}

const UserSchema = new Schema<UserInterface>(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxnlength: 20,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "user", "supervisor"],
      default: "user",
    },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    verified: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  let isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = model<UserInterface>("User", UserSchema);
export default User;
