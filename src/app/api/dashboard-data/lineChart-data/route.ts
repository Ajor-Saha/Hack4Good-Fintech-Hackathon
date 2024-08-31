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
    const range = searchParams.get("range");

    const now = new Date();
    let startDate;
    let groupBy;

    switch (range) {
      case "last 7 days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = { $dayOfWeek: "$date" };
        break;
      case "last 30 days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        groupBy = { $dayOfMonth: "$date" };
        break;
      case "last month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month
        groupBy = { $dayOfMonth: "$date" };

        const expensesForLastMonth = await ExpenseModel.aggregate([
          {
            $match: {
              user: ownerId,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: groupBy,
              totalSpent: { $sum: "$amount" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        const chartDataForLastMonth = expensesForLastMonth.map((expense) => ({
          name: `${new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            expense._id
          ).toLocaleString("default", { month: "short" })} ${expense._id}`,
          expenses: expense.totalSpent,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            message: "Expenses fetched successfully",
            data: chartDataForLastMonth,
          }),
          { status: 200 }
        );

      case "last 6 months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        groupBy = { $month: "$date" };
        break;
      case "last year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupBy = { $month: "$date" };
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid range" }),
          { status: 400 }
        );
    }

    const expenses = await ExpenseModel.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalSpent: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    let chartData;
    switch (range) {
      case "last 7 days":
        chartData = expenses.map((expense) => ({
          name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            expense._id - 1
          ],
          expenses: expense.totalSpent,
        }));
        break;
      case "last 30 days":
        chartData = expenses.map((expense) => ({
          name: `${new Date(
            now.getFullYear(),
            now.getMonth() - (expense._id > now.getDate() ? 1 : 0),
            expense._id
          ).toLocaleString("default", { month: "short" })} ${expense._id}`,
          expenses: expense.totalSpent,
        }));
        break;
      case "last 6 months":
      case "last year":
        chartData = expenses.map((expense) => ({
          name: new Date(0, expense._id - 1).toLocaleString("default", {
            month: "short",
          }),
          expenses: expense.totalSpent,
        }));
        break;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expenses fetched successfully",
        data: chartData,
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
