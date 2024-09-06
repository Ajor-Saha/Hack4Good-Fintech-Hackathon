import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import StockModel from "@/model/Stock";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";


export async function DELETE(
    request: Request,
    { params }: { params: { symbol: string } }
  ) {
    await dbConnect();
  
    try {
      const symbol = params.symbol;
  
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
  
      // Find the user's stock document
      const userStocks = await StockModel.findOne({ user: userId });
      
      if (!userStocks) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Stock document not found",
          }),
          { status: 404 }
        );
      }
  
      // Find the index of the stock with the given symbol
      const stockIndex = userStocks.stocks.findIndex(stock => stock.symbol === symbol);
      
      if (stockIndex === -1) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Stock not found",
          }),
          { status: 404 }
        );
      }
  
      // Remove the stock from the array
      userStocks.stocks.splice(stockIndex, 1);
      await userStocks.save();
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Stock deleted successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting stock:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error deleting stock",
        }),
        { status: 500 }
      );
    }
  }
  