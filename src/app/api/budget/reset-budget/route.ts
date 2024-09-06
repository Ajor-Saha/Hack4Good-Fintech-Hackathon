import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import BudgetModel from "@/model/Budget";


export async function PUT(req: Request) {
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

    const { category, limit } = await req.json();

    // Find the budget for the user
    const budget = await BudgetModel.findOne({ user: ownerId });

    if (!budget) {
      return new Response(
        JSON.stringify({ success: false, message: "Budget not found" }),
        { status: 404 }
      );
    }

    // Update only the specified category's limit and reset spent
    budget.categories = budget.categories.map((cat) => {
      if (cat.name === category) {
        return {
          ...cat,
          limit: limit, // Update limit for the selected category
          spent: 0, // Reset spent field only for the selected category
        };
      }
      return cat; // Leave other categories unchanged
    });

    // Save the updated budget
    await budget.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budget category reset successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting budget category:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error resetting budget category",
      }),
      { status: 500 }
    );
  }
}