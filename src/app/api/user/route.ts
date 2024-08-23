import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";


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
  
      
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "User details fetched successfully",
          data:user
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching user details:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching user details",
        }),
        { status: 500 }
      );
    }
  }