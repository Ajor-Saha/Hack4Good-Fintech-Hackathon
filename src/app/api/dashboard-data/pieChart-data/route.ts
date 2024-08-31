import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ExpenseModel from "@/model/Expense";
import { authOptions } from "../../auth/[...nextauth]/options";

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
  
      const url = new URL(req.url);
      const searchParams = new URLSearchParams(url.search);
      const time = searchParams.get("time");
  
      if (!time) {
        return new Response(
          JSON.stringify({ success: false, message: "Time parameter is missing" }),
          { status: 400 }
        );
      }
  
      const monthIndex = new Date(`${time} 1, 2024`).getMonth(); // Using 2023 as a reference year
      const now = new Date();
      const startDate = new Date(now.getFullYear(), monthIndex, 1);
      const endDate = new Date(now.getFullYear(), monthIndex + 1, 0);
  
      const expenses = await ExpenseModel.aggregate([
        {
          $match: {
            user: ownerId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
  
      const totalExpense = expenses.reduce(
        (acc, expense) => acc + expense.totalAmount,
        0
      );
  
      const chartData = expenses.map((expense) => ({
        name: expense._id,
        value: expense.totalAmount,
        percentage: ((expense.totalAmount / totalExpense) * 100).toFixed(2),
      }));
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Expenses fetched successfully",
          data: {
            totalExpense,
            chartData,
          },
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching expenses",
        }),
        { status: 500 }
      );
    }
  }