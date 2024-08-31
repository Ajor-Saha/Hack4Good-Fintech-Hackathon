import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
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
    const { name, limit } = await req.json();

    if (!name || !limit) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Name and limit are required",
        }),
        { status: 400 }
      );
    }

    // Get current month and year
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    // Check if budget for the current month and year already exists for the user
    let budget = await BudgetModel.findOne({ user: ownerId });

    if (budget) {
      // Check if the category name already exists
      const categoryExists = budget.categories.some(
        (category) => category.name === name
      );

      if (categoryExists) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Category with this name already exists for this month.",
          }),
          { status: 400 }
        );
      }

      // Add new category to existing budget
      budget.categories.unshift({ name, limit, spent: 0 });
    } else {
      // Create a new budget
      budget = new BudgetModel({
        user: ownerId,
        month,
        year,
        categories: [{ name, limit, spent: 0 }],
      });
    }

    await budget.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budget updated successfully",
        budget,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating budget:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating budget",
      }),
      { status: 500 }
    );
  }
}