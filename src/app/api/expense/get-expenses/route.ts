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

    // Query for the expenses of the current user, sorted by creation date (newest first)
    const expenses = await ExpenseModel.find({ user: ownerId }).sort({
      createdAt: -1,
    });

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
