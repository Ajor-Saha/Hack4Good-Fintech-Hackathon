import mongoose, { Schema, Document } from "mongoose";

interface Category {
  name: string;
  limit: number;
  spent: number;
  date: Date;
}

interface Notification extends Document {
  user: mongoose.Types.ObjectId;
  categories: Category[];
}

const NotificationSchema: Schema<Notification> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<Notification>) ||
  mongoose.model<Notification>("Notification", NotificationSchema);

export default NotificationModel;
