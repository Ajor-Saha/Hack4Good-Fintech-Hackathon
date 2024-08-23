import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

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
      const { currentPassword, newPassword } = await req.json();
  
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Current password is incorrect",
          }),
          { status: 400 }
        );
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
  
      // Save the updated user
      await user.save();
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Password updated successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating password:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error updating password",
        }),
        { status: 500 }
      );
    }
  }