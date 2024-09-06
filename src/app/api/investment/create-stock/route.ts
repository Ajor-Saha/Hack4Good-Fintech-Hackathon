import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import StockModel from "@/model/Stock";

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
  
      // Extract stock details from req.body
      const { symbol, price, volume } = await req.json();
  
      if (!symbol || !price || !volume) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "symbol, price, and volume are required",
          }),
          { status: 400 }
        );
      }
  
      // Check if a stock document exists for the user
      let stockDocument = await StockModel.findOne({ user: ownerId });
  
      if (stockDocument) {
        // Add the new stock to the existing document
        stockDocument.stocks.push({ symbol, price, volume });
        await stockDocument.save();
      } else {
        // Create a new stock document for the user
        stockDocument = new StockModel({
          user: ownerId,
          stocks: [{ symbol, price, volume }],
        });
        await stockDocument.save();
      }
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Stock added successfully",
          stock: stockDocument,
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating or updating stock:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error creating or updating stock",
        }),
        { status: 500 }
      );
    }
  }
  