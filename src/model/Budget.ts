import mongoose, { Schema, Document } from "mongoose";

interface Category {
  name: string;
  limit: number;
  spent: number;
}

interface Budget extends Document {
  user: mongoose.Types.ObjectId;
  month: string;
  year: number;
  categories: Category[];
}

const BudgetSchema: Schema<Budget> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        limit: {
          type: Number,
          required: true,
        },
        spent: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);


const BudgetModel =
  (mongoose.models.Budget as mongoose.Model<Budget>) ||
  mongoose.model<Budget>("Budget", BudgetSchema);

export default BudgetModel;
