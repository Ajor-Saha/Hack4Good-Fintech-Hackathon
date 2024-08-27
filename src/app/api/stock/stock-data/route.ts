import dbConnect from "@/lib/dbConnect";
import axios from "axios";

export async function GET(req: Request) {
    await dbConnect();

    try {
       /* const session = await getServerSession(authOptions);
        const _user = session?.user;

        if (!session || !_user) {
            return new Response(
                JSON.stringify({ success: false, message: 'Not authenticated' }),
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
                    message: 'User does not exist or is not verified',
                }),
                { status: 400 }
            );
        } */

        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol');
        const interval = searchParams.get('interval') || '1min';
        const adjusted = searchParams.get('adjusted') || 'true';
        const outputsize = searchParams.get('outputsize') || 'compact';
        const datatype = searchParams.get('datatype') || 'json';

        if (!symbol) {
            return new Response(
                JSON.stringify({ success: false, message: 'Symbol is required' }),
                { status: 400 }
            );
        }

        // Fetch Intraday Stock Data
        const API_KEY = process.env.YOUR_API_KEY;
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol,
                interval,
                adjusted,
                outputsize,
                datatype,
                apikey: API_KEY,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Intraday data fetched successfully',
                data: response.data,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching intraday stock data:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Error fetching intraday stock data',
            }),
            { status: 500 }
        );
    }
}