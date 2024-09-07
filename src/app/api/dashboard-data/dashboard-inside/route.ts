import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ExpenseModel from "@/model/Expense";

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

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    // Get query parameters
    const timeFilter = searchParams.get("time");
    const searchCategory = searchParams.get("title");

    // Calculate the date range based on the time filter
    const currentDate = new Date();
    let startDate: Date;
    let endDate = currentDate;

    switch (timeFilter) {
      case "last 7 days":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case "last 30 days":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case "last month":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        break;
      case "last 6 months":
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 6);
        startDate.setDate(1); // Ensure start from 1st day of the month
        break;
      case "last year":
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // 1st January of the previous year
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31, 23, 59, 59); // 31st December of the previous year
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid time filter" }),
          { status: 400 }
        );
    }

    // Fetch expenses based on the date range
    const expenses = await ExpenseModel.find({
      user: ownerId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    let responseMessage: string;
    let result: number | string;

    if (searchCategory === "Expenses") {
      // Calculate total expenses
      const totalExpenses = expenses.reduce(
        (acc, expense) => acc + expense.amount,
        0
      );
      result = totalExpenses;
      responseMessage = "Total expenses calculated successfully.";
    } else if (searchCategory === "Items") {
      // Count the number of expenses (items)
      const itemCount = expenses.length;
      result = itemCount;
      responseMessage = "Number of expense items counted successfully.";
    } else if (searchCategory === "Savings") {
      // Calculate savings
      const monthsInRange =
        currentDate.getMonth() -
        startDate.getMonth() +
        1 +
        12 * (currentDate.getFullYear() - startDate.getFullYear());

      const totalExpenses = expenses.reduce(
        (acc, expense) => acc + expense.amount,
        0
      );
      let totalSavings: number;

      if (timeFilter === "last 30 days" || timeFilter === "last month") {
        // For last 30 days or last month, subtract totalExpenses from the monthly salary
        totalSavings = user.monthlySalary - totalExpenses;
      } else if (timeFilter === 'last year') {
        totalSavings = (user.monthlySalary*12) - totalExpenses;
      } else {
        // For last 6 months, calculate savings based on the months in range and total expenses
        const monthlySalary = user.monthlySalary;
        totalSavings = monthlySalary * (monthsInRange-1) - totalExpenses;
      }

      result = totalSavings;
      responseMessage = "Total savings calculated successfully.";
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid search category" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: responseMessage,
        data: result,
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
