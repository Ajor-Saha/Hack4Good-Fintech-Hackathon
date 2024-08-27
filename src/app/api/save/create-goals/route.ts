import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import SaveGoalModel from "@/model/SaveGoal";
import ExpenseModel from "@/model/Expense";


export async function POST(req: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const ownerId = new mongoose.Types.ObjectId(_user._id);

    // Check if user exists and is verified
    const user = await UserModel.findById(ownerId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Extract budget details from req.body
    const { goalAmount } = await req.json();

    if (!goalAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Goal Amount is required",
        }),
        { status: 400 }
      );
    }

    // Check if a save goal already exists for this user
    let saveGoal = await SaveGoalModel.findOne({ user: ownerId });

    if (saveGoal) {
      // If save goal exists, update the goalAmount field
      saveGoal.goalAmount = goalAmount;
    } else {
      // Extract month and year from startDate
      const startDate = new Date();
      const startMonth = startDate.getMonth(); // 0-11
      const startYear = startDate.getFullYear();

      // Calculate total expenses from the start date
      const expenses = await ExpenseModel.aggregate([
        {
          $match: {
            user: ownerId,
            date: {
              $gte: new Date(startYear, startMonth, 1),
              $lt: new Date(startYear, startMonth + 1, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$amount" },
          },
        },
      ]);

      const totalExpenses = expenses[0]?.totalExpenses || 0;

      // Calculate currentSave
      let currentSave = user.monthlySalary - totalExpenses;

      if (currentSave < 0) {
        currentSave = 0;
      }

      // If no save goal exists, create a new one
      saveGoal = new SaveGoalModel({
        user: ownerId,
        reason: "Your specified reason", // Replace with the actual reason if provided
        startDate,
        currentSave,
        goalAmount,
      });
    }

    await saveGoal.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: saveGoal.isNew
          ? "Saving Goal created successfully"
          : "Saving Goal updated successfully",
        data: saveGoal,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating or updating saving goal:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating or updating saving goal",
      }),
      { status: 500 }
    );
  }
}