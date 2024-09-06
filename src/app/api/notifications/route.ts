import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import NotificationModel from "@/model/Notifications";


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
  
      // Calculate the date for 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 
      // Fetch notifications for the user
      const notifications = await NotificationModel.findOne({
        user: ownerId,
        categories: {
          $elemMatch: {
            date: { $gte: thirtyDaysAgo }, // Match categories where 'date' is within the last 30 days
          },
        },
      });
  
      // If no notifications found
      if (!notifications) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No notifications found within the last 30 days",
          }),
          { status: 404 }
        );
      }
  
      // Return notifications
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notifications fetched successfully",
          data: notifications,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching notifications",
        }),
        { status: 500 }
      );
    }
  }