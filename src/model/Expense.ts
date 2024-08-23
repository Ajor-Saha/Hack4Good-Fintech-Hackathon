import mongoose, { Schema, Document } from "mongoose";

interface Expense extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  date: Date;
  description?: string;
}


const ExpenseSchema: Schema<Expense> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const ExpenseModel =
  (mongoose.models.Expense as mongoose.Model<Expense>) ||
  mongoose.model<Expense>("Expense", ExpenseSchema);

export default ExpenseModel;
