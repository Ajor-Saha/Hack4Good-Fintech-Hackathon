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

    // Assuming user has a monthlySalary field
    const monthlySalary = user.monthlySalary;

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const range = searchParams.get("range");

    const now = new Date();
    let startDate;
    let monthsDifference; // to calculate savings later
    let groupBy;

    switch (range) {
      case "last 6 months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Include this month + last 5 months
        monthsDifference = 6;
        groupBy = { $month: "$date" };
        break;
      case "last 6 year":
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1); // Include this year + last 5 years
        monthsDifference = 6 * 12;
        groupBy = { $year: "$date" };
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid range" }),
          { status: 400 }
        );
    }

    // Fetch the expenses within the range
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

    // Prepare a full list of months or years in the range
    let fullRange = [];
    if (range === "last 6 months") {
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString("default", { month: "short" });
        fullRange.unshift({ name: monthName, expenses: 0, savings: 0 });
      }
    } else if (range === "last 6 year") {
      for (let i = 0; i < 6; i++) {
        const year = now.getFullYear() - i;
        fullRange.unshift({ name: year.toString(), expenses: 0, savings: 0 });
      }
    }

    // Merge expenses into the full range
    fullRange = fullRange.map((period) => {
      const foundExpense = expenses.find((exp) => {
        if (range === "last 6 months") {
          return period.name === new Date(0, exp._id - 1).toLocaleString("default", { month: "short" });
        } else if (range === "last 6 year") {
          return period.name === exp._id.toString();
        }
      });

      let totalSpent = foundExpense ? foundExpense.totalSpent : 0;
      let savings;

      if (range === "last 6 months") {
        // Monthly savings
        savings = monthlySalary - totalSpent;
      } else if (range === "last 6 year") {
        // Yearly savings
        const totalIncome = monthlySalary * 12;
        savings = totalIncome - totalSpent;
      }

      return {
        name: period.name,
        expenses: totalSpent,
        savings: savings,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expenses and savings fetched successfully",
        data: fullRange,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching expenses and savings:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching expenses and savings",
      }),
      { status: 500 }
    );
  }
}
