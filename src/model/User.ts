import mongoose, { Schema, Document } from "mongoose";

interface User extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  currency: string;
  monthlySalary: number;
}

const UserSchema: Schema<User> = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
    },
    verifyCode: {
      type: String,
      required: [true, "Verify Code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify Code Expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    monthlySalary: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "BDT"],
      default: "USD", // Default currency
    },

  },
  { timestamps: true }
);


const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
