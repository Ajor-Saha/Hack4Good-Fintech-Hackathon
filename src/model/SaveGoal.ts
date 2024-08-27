import mongoose, { Schema, Document } from "mongoose";

interface SaveGoal extends Document {
  user: mongoose.Types.ObjectId;
  startDate: Date;
  currentSave: number;
  goalAmount: number;
}

const SaveGoalSchema: Schema<SaveGoal> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentSave: {
      type: Number,
      required: true,
    },
    goalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const SaveGoalModel =
  (mongoose.models.SaveGoal as mongoose.Model<SaveGoal>) ||
  mongoose.model<SaveGoal>("SaveGoal", SaveGoalSchema);

export default SaveGoalModel;
