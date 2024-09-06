import mongoose, { Schema, Document } from "mongoose";

interface Stock extends Document {
  user: mongoose.Types.ObjectId;
  stocks: {
    symbol: string;
    price: number;
    volume: number;
  }[];
}

const StockSchema: Schema<Stock> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stocks: [
      {
        symbol: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        volume: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const StockModel =
  (mongoose.models.Stock as mongoose.Model<Stock>) ||
  mongoose.model<Stock>("Stock", StockSchema);

export default StockModel;
