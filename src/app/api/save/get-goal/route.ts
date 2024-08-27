import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import SaveGoalModel from "@/model/SaveGoal";
import ExpenseModel from "@/model/Expense";


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

        const saveGoal = await SaveGoalModel.findOne({ user: ownerId });

        if (!saveGoal) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No save goal found",
                    data: saveGoal,
                }),
                { status: 401 }
            );
        }

        const { startDate } = saveGoal;
        const monthlySalary = user.monthlySalary;

        // Set start date to the beginning of the start month
        const start = new Date(startDate);
        start.setDate(1); // Set to the 1st of the month
        start.setHours(0, 0, 0, 0); // Set to the start of the day

        // Set current date to the end of the current month
        const now = new Date();
        now.setMonth(now.getMonth() + 1); // Move to the next month
        now.setDate(0); // Set to the last day of the current month
        now.setHours(23, 59, 59, 999); // Set to the end of the day

        // Calculate the difference in months from startDate to currentDate
        const monthsDifference =
            (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

        // Aggregate expenses by month and calculate total expenses since startDate
        const expenses = await ExpenseModel.aggregate([
            {
                $match: {
                    user: ownerId,
                    date: { $gte: start, $lte: now },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    totalMonthlyExpense: { $sum: "$amount" },
                },
            },
        ]);

        // Calculate total savings
        let totalSavings = 0;

        for (let i = 0; i <= monthsDifference; i++) {
            const currentMonth = {
                year: start.getFullYear(),
                month: start.getMonth() + 1,
            };

            const currentMonthExpense = expenses.find(
                (exp) =>
                    exp._id.year === currentMonth.year && exp._id.month === currentMonth.month
            )?.totalMonthlyExpense || 0;

            totalSavings += monthlySalary - currentMonthExpense;

            // Move to the next month
            start.setMonth(start.getMonth() + 1);
        }

        // Update currentSave with the calculated value
        saveGoal.currentSave = totalSavings;
        await saveGoal.save();

        return new Response(
            JSON.stringify({
                success: true,
                message: "Saving Goal fetched and updated successfully",
                data: saveGoal,
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error fetching and updating saving goal:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error fetching and updating saving goal",
            }),
            { status: 500 }
        );
    }
}