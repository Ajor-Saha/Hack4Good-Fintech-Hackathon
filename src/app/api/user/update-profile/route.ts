import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";

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

    // Extract the fields from the request body
    const { fullName, username, monthlySalary } = await req.json();

    
    

    // Update the user details
    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.monthlySalary = monthlySalary || user.monthlySalary;

    // Save the updated user
    await user.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "User details updated successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user details:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error updating user details",
      }),
      { status: 500 }
    );
  }
}
