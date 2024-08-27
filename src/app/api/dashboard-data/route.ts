import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/options";
import ExpenseModel from "@/model/Expense";

/*
saving money for this month
total expense for this month + total item
Saving goals
*/

export async function GET(req: Request) {
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

    // Get the current date and calculate the start of the current month
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Fetch total expenses for the current month
    const expenses = await ExpenseModel.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: startOfMonth, $lt: currentDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalItems: { $sum: 1 },
        },
      },
    ]);

    const totalAmount = expenses.length > 0 ? expenses[0].totalAmount : 0;
    const totalItems = expenses.length > 0 ? expenses[0].totalItems : 0;

    // Calculate savings for the current month
    const savings = user.monthlySalary - totalAmount;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budget fetched successfully",
        data: {
            monthlySalary: user.monthlySalary,
            totalExpenses: totalAmount,
            totalItems,
            savings,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching budget:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching budget",
      }),
      { status: 500 }
    );
  }
}
