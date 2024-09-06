import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import BudgetModel from "@/model/Budget";
import ExpenseModel from "@/model/Expense";
import StockModel from "@/model/Stock";
import SaveGoalModel from "@/model/SaveGoal";

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
      const user = await UserModel.findById({ _id: ownerId });
      if (!user?.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      // Query for budget, expenses, stocks, and save goals
      const budget = await BudgetModel.findOne({ user: ownerId });
      const expenses = await ExpenseModel.find({ user: ownerId });
      const stocks = await StockModel.findOne({ user: ownerId });
      const saveGoal = await SaveGoalModel.findOne({ user: ownerId });
  
      // Create response array with name and flag conditions
      const responseArray = [
        {
          name: "budget",
          route: "/my-budget",
          flag: budget && budget.categories.length > 0 ? true : false,
        },
        {
          name: "expense",
          route: "/my-expenses",
          flag: expenses && expenses.length > 0 ? true : false,
        },
        {
          name: "stock",
          route: "/my-investment",
          flag: stocks && stocks.stocks.length > 0 ? true : false,
        },
        {
          name: "savegoal",
          route: "/",
          flag: saveGoal ? true : false,
        },
      ];
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Data fetched successfully",
          data: responseArray,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching data",
        }),
        { status: 500 }
      );
    }
  }
  