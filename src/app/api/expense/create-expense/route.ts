import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ExpenseModel from "@/model/Expense";
import BudgetModel from "@/model/Budget";


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

    // Extract budget details from req.body
    const { description, amount, date, category } = await req.json();

    console.log(date);

    // Validate the input (this can be expanded based on your requirements)
    if (!amount || !category) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Amount and category are required fields",
        }),
        { status: 400 }
      );
    }

    // Create the new expense
    const newExpense = new ExpenseModel({
      user: ownerId,
      description,
      amount,
      date,
      category,
    });

    await newExpense.save();

    const budget = await BudgetModel.findOne({ user: ownerId });

    if (budget) {
      const categoryIndex = budget.categories.findIndex(
        (cat) => cat.name === category
      );

      if (categoryIndex !== -1) {
        budget.categories[categoryIndex].spent += amount;
      } else {
        // If the category doesn't exist in the budget, you can either throw an error
        // or add a new category to the budget with the spent amount. Here's an example of adding:
        budget.categories.push({ name: category, limit: 0, spent: amount });
      }

      await budget.save();
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No budget found for the user",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expense created successfully",
        data: newExpense,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating expense",
      }),
      { status: 500 }
    );
  }
}
