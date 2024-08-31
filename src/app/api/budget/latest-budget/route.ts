import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import BudgetModel from "@/model/Budget";

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

    // Query for the 3 most recent budgets of the current user
    const budgets = await BudgetModel.find({ user: ownerId })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(3); // Limit to 3 most recent budgets

    if (budgets.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No budgets found for this user",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budgets fetched successfully",
        data: budgets,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching budgets",
      }),
      { status: 500 }
    );
  }
}
