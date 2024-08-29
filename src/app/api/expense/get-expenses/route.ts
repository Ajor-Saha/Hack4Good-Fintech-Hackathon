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
    const searchCategory = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    // Set date range based on time filter
    let dateFilter: { [key: string]: any } = {};
    const now = new Date();
    
    if (timeFilter === "last 7 days") {
      dateFilter = { date: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
    } else if (timeFilter === "last 30 days") {
      dateFilter = { date: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    } else if (timeFilter === "last month") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFilter = { date: { $gte: lastMonthStart, $lte: lastMonthEnd } };
    } else if (timeFilter === "last 6 months") {
      dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 6)) } };
    } else if (timeFilter === "last year") {
      dateFilter = { date: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
    }

    // Build the query with date filter and optional category search
    const query: { [key: string]: any } = { user: ownerId, ...dateFilter };
    if (searchCategory) {
      query.category = { $regex: new RegExp(searchCategory, "i") }; // Case-insensitive search
    }

    // Query for the expenses of the current user, sorted by creation date (newest first)
    const expenses = await ExpenseModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalExpenses = await ExpenseModel.countDocuments(query);
    const totalPages = Math.ceil(totalExpenses / limit);

    if (!expenses || expenses.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No expenses found for this user",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expenses fetched successfully",
        data: expenses,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalExpenses: totalExpenses,
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