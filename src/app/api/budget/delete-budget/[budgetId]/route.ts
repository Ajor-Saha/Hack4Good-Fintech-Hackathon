import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import BudgetModel from "@/model/Budget";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { budgetId: string } }
) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const categoryName = searchParams.get("name");

    if (!categoryName) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Category name is required",
        }),
        { status: 400 }
      );
    }

    const budgetId = params.budgetId;

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(_user._id);
    // Check if user exists and is verified
    const user = await UserModel.findById(userId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    const budget = await BudgetModel.findById(budgetId);
    if (!budget) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Budget not found",
        }),
        { status: 404 }
      );
    }

    // Filter out the category to be deleted
    budget.categories = budget.categories.filter(
      (category) => category.name !== categoryName
    );

    await budget.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budget deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting budget:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting budget",
      }),
      { status: 500 }
    );
  }
}
