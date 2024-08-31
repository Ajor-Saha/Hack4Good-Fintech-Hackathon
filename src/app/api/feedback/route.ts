import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ExpenseModel from "@/model/Expense";
import { authOptions } from "../auth/[...nextauth]/options";
import SaveGoalModel from "@/model/SaveGoal";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const monthlySalary = user.monthlySalary;

    // Retrieve user save goal details
    const saveGoal = await SaveGoalModel.findOne({ user: ownerId });

    if (!saveGoal) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No savings goal found for the user",
        }),
        { status: 404 }
      );
    }

    const { currentSave, goalAmount } = saveGoal;

    // Extract budget details from req.body
    const { startDate, endDate } = await req.json();

    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "End date must be after start date",
          }),
          { status: 400 }
        );
      }

    // Aggregate expenses by category and sum amounts
    const expensesByCategory = await ExpenseModel.aggregate([
      {
        $match: {
          user: ownerId,
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    let GEMINI_API_KEY: string = "";

    if (process.env.GEMINI_API_KEY) {
      GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Create a prompt to generate personalized recommendations
    const prompt = `
        Here is the user's financial data:
        - Monthly Salary: ${monthlySalary}
        - Current Savings: ${currentSave}
        - Savings Goal: ${goalAmount}
        - Expenses by Category: ${JSON.stringify(expensesByCategory)}

        Please provide personalized recommendations in a structured format with headings and bullet points. Break down the recommendations into the following categories:

        1. Income Overview
        2. Savings Potential
        3. Expense Analysis (by category)
        4. Recommendations
        5. Time to Goal Achievement

        Ensure the output is well-organized and formatted with proper headings and bullet points.
      `;

    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent(prompt);

    const recommendations =
      result?.response.text() || "No recommendations available.";

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Expenses calculated and recommendations generated successfully",
        data: {
          expensesByCategory,
          monthlySalary,
          currentSave,
          goalAmount,
          recommendations,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error calculating expenses:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error calculating expenses",
      }),
      { status: 500 }
    );
  }
}
