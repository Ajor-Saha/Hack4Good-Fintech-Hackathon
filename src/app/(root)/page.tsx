"use client";

import CustomBarChart from "@/components/chart/CustomBarChart";
import CustomLineChart from "@/components/chart/CustomLineChart";
import CustomPieChart from "@/components/chart/CustomPieChart";
import CustomCard from "@/components/CustomCard";
import LatestExpenseTable from "@/components/LatestExpenseTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { MdSavings } from "react-icons/md";

const Home = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [dashboardData, setDashBoardData] = useState<any>({});
  const [saveData, setSaveData] = useState<any>({});
  const [budgetCategories, setBudgetCategories] = useState<any>({});
  const [goalAmount, setGoalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRest, setLoadingReset] = useState<boolean>(false);
  const [range, setRange] = useState<string>("last 30 days");
  const [rangeBar, setRangeBar] = useState<string>("last 6 months");
  const { toast } = useToast();
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/dashboard-data");
      if (response.data.success) {
        setDashBoardData(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching dashboard data";
    }
  }, []);

  const fetchSavingGoal = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/save/get-goal");
      if (response.data.success) {
        setSaveData(response.data.data);
        setGoalAmount(saveData.goalAmount);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching dashboard data";
    }
  }, [saveData.goalAmount]);

  const fetchUserBudgets = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/budget/get-budget");
      if (response.data.success) {
        setBudgetCategories(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      toast({ description: errorMessage });
    }
  }, [toast]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
      fetchSavingGoal();
      fetchUserBudgets();
    }
  }, [session, fetchDashboardData, fetchSavingGoal, fetchUserBudgets]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalAmount(Number(e.target.value));
  };

  const handleSaveGoal = async () => {
    setLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/save/create-goals", {
        goalAmount,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        fetchSavingGoal();
      } else {
        toast({
          title: "Failed",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while creating saveGoal data";
    } finally {
      setLoading(false);
    }
  };

  const handleResetGoal = async () => {
    setLoadingReset(true);

    try {
      const response = await axios.put<ApiResponse>("/api/save/reset-goal", {
        goalAmount,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        fetchSavingGoal();
      } else {
        toast({
          title: "Failed",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ?? "Error while reset saveGoal data";
    } finally {
      setLoadingReset(false);
    }
  };

  const progressValue =
    goalAmount > 0
      ? ((saveData?.currentSave) / goalAmount) * 100
      : 0;


  const handleSeeAll = (route:string) => {
    router.push(route);
  }

  return (
    <div className="ml-5 pb-10">
      <h1 className="text-2xl font-bold p-5 text-green-900 dark:text-green-500">
        Hello, {user?.username}
      </h1>
      <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3  justify-items-center">
        <CustomCard
          title="Expenses"
          amount={dashboardData.totalExpenses}
          description="Expenses incurred"
        />
        <CustomCard
          title="Items"
          amount={dashboardData.totalItems}
          description="Total items"
        />
        <CustomCard
          title="Savings"
          amount={dashboardData.savings}
          description="Savings for"
        />

        <Card className="w-full sm:w-[300px] md:w-[350px] flex flex-col justify-between h-[220px] mx-auto mb-5 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2 space-y-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-base font-medium">Savings Goal</CardDescription>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                  >
                    {goalAmount > 0 ? "Edit Goals" : "Create Goals"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Saving Goals</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                      Set or update your saving goal. Click <b>reset</b> to create a new goal with the current date.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="goalAmount" className="text-right font-medium">
                        Goal Amount
                      </Label>
                      <Input
                        id="goalAmount"
                        placeholder="$1000"
                        className="col-span-3"
                        type="number"
                        value={goalAmount}
                        onChange={handleGoalChange}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    {goalAmount > 0 && (
                      <Button 
                        onClick={handleResetGoal}
                        variant="outline"
                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        Reset
                      </Button>
                    )}
                    <Button
                      type="submit"
                      onClick={handleSaveGoal}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </span>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MdSavings className="w-5 h-5" />
              <span className="text-sm">Track your savings progress</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
                <span className="text-xl font-semibold text-green-500">${(saveData?.currentSave || 0).toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">Goal</span>
                <span className="text-xl font-semibold">${(goalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Progress 
                value={progressValue} 
                className="h-2.5 bg-gray-100 dark:bg-gray-700"
              />
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                {progressValue.toFixed(0)}% completed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between pr-2 xl:pr-2">
        <div className="xl:w-1/2  w-full px-10 py-5 mt-10 border border-gray-600">
          <div className="flex justify-between">
            <div className="pb-2">
              <h2>Transaction</h2>
              <span>Expenses</span>
            </div>
            <Select onValueChange={(value) => setRange(value)}>
              <SelectTrigger className="w-[150px] lg:w-[140px]">
                <SelectValue placeholder="Select a Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Range</SelectLabel>
                  <SelectItem value="last 7 days">Last 7 days</SelectItem>
                  <SelectItem value="last 30 days">Last 30 days</SelectItem>
                  <SelectItem value="last month">Last month</SelectItem>
                  <SelectItem value="last 6 months">Last 6 months</SelectItem>
                  <SelectItem value="last year">Last year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <CustomLineChart range={range} />
          </div>
        </div>
        <div className="xl:w-1/2 w-full px-10 py-5 mt-10 border border-gray-600">
          <div className="flex justify-between">
            <div className="pb-2">
              <h2>Expense Transaction</h2>
              <span>Savings</span>
            </div>
            <Select onValueChange={(value) => setRangeBar(value)}>
              <SelectTrigger className="w-[150px] lg:w-[140px]">
                <SelectValue placeholder="Select a Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Range</SelectLabel>
                  <SelectItem value="last 6 months">Last 6 months</SelectItem>
                  <SelectItem value="last 6 year">Last 6 year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <CustomBarChart range = {rangeBar} />
          </div>
        </div>
      </div>
      <div className="xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between pr-2 xl:pr-2 mt-8">
        <div className="border border-gray-600 xl:w-1/2 w-full">
          <CustomPieChart />
        </div>
        <div className="border border-gray-600 xl:w-1/2 w-full">
          <div className="flex flex-col p-5 bg-gray-50 h-full dark:bg-gray-700">
            <div className="flex justify-between border-b border-gray-400">
              <span className="text-sm mt-2 text-gray-300 font-bold">
                Recent Budgets
              </span>
              <Button variant="outline" onClick={() => handleSeeAll("/my-budget")} className="mb-2 dark:text-blue-500">
                See All
              </Button>
            </div>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Spent
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Limit
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgetCategories?.categories?.length > 0 ? (
                  budgetCategories.categories.slice(0, 4).map((budget: any) => (
                    <tr
                      key={budget._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-4">{budget?.name}</td>
                      <td className="px-6 py-4">{budget?.spent}</td>
                      <td className="px-6 py-4">{budget?.limit}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center dark:text-white"
                    >
                      No budget available for you. Create New budget category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between pr-2 xl:pr-2 mt-8">
        <div className="xl:w-1/2 w-full border border-gray-600">
          <LatestExpenseTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
