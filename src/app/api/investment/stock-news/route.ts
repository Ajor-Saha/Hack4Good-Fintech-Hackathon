import { DefaultApi } from "finnhub-ts";
import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import StockModel from "@/model/Stock";

// Initialize the Finnhub client
const finnhubClient = new DefaultApi({
  apiKey: process.env.FINNHUB_API_KEY as string,
  isJsonMime: (input: string) => {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  },
});

export async function GET(req: Request) {
  await dbConnect(); // Ensure the database is connected

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

    const userStocks = await StockModel.findOne({ user: ownerId });

    if (!userStocks || userStocks.stocks.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No stocks found for the user",
        }),
        { status: 404 }
      );
    }

    // Get the current date
    const toDate = new Date();
    // Calculate the date three months ago
    const fromDate = new Date();
    fromDate.setMonth(toDate.getMonth() - 1);

    // Format the dates to 'YYYY-MM-DD'
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];

    // Extract symbols from the user's stocks
    const symbols = userStocks.stocks.map((stock) => stock.symbol);

    // Fetch news for each symbol
    const newsPromises = symbols.map((symbol) =>
      fetchCompanyNews(symbol, from, to)
    );
    const newsResults = await Promise.all(newsPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Company news fetched successfully",
        data: newsResults,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company news:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch company news",
      }),
      { status: 500 }
    );
  }
}

// Function to fetch company news with `any` type to bypass strict type checking
async function fetchCompanyNews(
  symbol: string,
  from: string,
  to: string
): Promise<any> {
  try {
    const response = await finnhubClient.companyNews(symbol, from, to);
    return response.data;
  } catch (error) {
    console.error("Error fetching company news:", error);
    throw error;
  }
}
