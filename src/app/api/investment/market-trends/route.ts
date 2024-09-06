import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";

const ALPHA_VANTAGE_API_KEY = process.env.YOUR_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

type TickerData = {
  ticker: string;
  name: string;
  price: string;
  change: string;
  change_percent: string;
  volume: string;
  details: {
    Symbol: string;
    AssetType: string;
    Name: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    Address: string;
    OfficialSite: string;
  } | null;
};

type MarketTrendData = {
  topGainers: TickerData[];
  topLosers: TickerData[];
  mostActive: TickerData[];
};

// Function to fetch stock details from Alpha Vantage
async function fetchStockDetails(ticker: string) {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: "OVERVIEW",
        symbol: ticker,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const data = response.data || {};
    return {
      Symbol: data["Symbol"],
      AssetType: data["AssetType"],
      Name: data["Name"],
      Currency: data["Currency"],
      Country: data["Country"],
      Sector: data["Sector"],
      Industry: data["Industry"],
      Address: data["Address"],
      OfficialSite: data["OfficialSite"], // Assuming "OfficialSite" is the correct field name; adjust if needed
    };
  } catch (error) {
    console.error(`Error fetching details for ticker ${ticker}:`, error);
    return null;
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
   /* const session = await getServerSession(authOptions);
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
    } */

    // Fetch top gainers, losers, and most active tickers
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: "TOP_GAINERS_LOSERS",
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const data = response.data || {};

    const topGainers = data["top_gainers"] || [];
    const topLosers = data["top_losers"] || [];
    const mostActive = data["most_active"] || [];

    // Helper function to map data and fetch details
    const mapAndFetchDetails = async (items: any[]) => {
      return Promise.all(
        items.map(async (item: any) => {
          const details = await fetchStockDetails(item["ticker"]);
          return {
            ticker: item["ticker"],
            name: item["name"],
            price: item["price"],
            change: item["change"],
            change_percent: item["change_percent"],
            volume: item["volume"],
            details, // Append the filtered details
          };
        })
      );
    };

    // Prepare the market trend data with stock details
    const marketTrendData: MarketTrendData = {
      topGainers: await mapAndFetchDetails(topGainers),
      topLosers: await mapAndFetchDetails(topLosers),
      mostActive: await mapAndFetchDetails(mostActive),
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Market trends fetched successfully",
        data: marketTrendData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching market trends:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching market trends",
      }),
      { status: 500 }
    );
  }
}
