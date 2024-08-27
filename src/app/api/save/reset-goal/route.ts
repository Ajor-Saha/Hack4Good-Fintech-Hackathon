import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import SaveGoalModel from "@/model/SaveGoal";
import ExpenseModel from "@/model/Expense";

export async function PUT(req: Request) {
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

    // Extract month and year from startDate
    const startDate = new Date();
    const startMonth = startDate.getMonth(); // 0-11
    const startYear = startDate.getFullYear();

    // Calculate total expenses for the start date's month and the current month
    const expenses = await ExpenseModel.aggregate([
      {
        $match: {
          user: ownerId,
          date: {
            $gte: new Date(startYear, startMonth, 1),
            $lt: new Date(), // Up to the current date
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

    // Find the existing save goal for the user
    const saveGoal = await SaveGoalModel.findOne({ user: ownerId });

    if (!saveGoal) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Saving goal not found for the user",
        }),
        { status: 404 }
      );
    }

    // Update the saveGoal fields
    saveGoal.currentSave = currentSave;
    saveGoal.goalAmount = goalAmount;
    saveGoal.startDate = startDate;

    // Save the updated saveGoal
    await saveGoal.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Saving goal updated successfully",
        data: saveGoal,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating saving goal:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error updating saving goal",
      }),
      { status: 500 }
    );
  }
}
