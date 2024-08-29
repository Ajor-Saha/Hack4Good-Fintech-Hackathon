"use client";

import CustomBarChart from "@/components/chart/CustomBarChart";
import CustomLineChart from "@/components/chart/CustomLineChart";
import CustomPieChart from "@/components/chart/CustomPieChart";
import CustomCard from "@/components/CustomCard";
import LatestBudgetTable from "@/components/LatestBudgetTable";
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
import React, { useCallback, useEffect, useState } from "react";

const Home = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [dashboardData, setDashBoardData] = useState<any>({});
  const [saveData, setSaveData] = useState<any>({});

  const [goalAmount, setGoalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRest, setLoadingReset] = useState<boolean>(false);
  const { toast } = useToast();

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

  useEffect(() => {
    if (session) {
      fetchDashboardData();
      fetchSavingGoal();
    }
  }, [session, fetchDashboardData, fetchSavingGoal]);

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

        <Card className="w-[250px] flex flex-col justify-between h-[180px] mx-auto mb-5">
          <CardHeader>
            <CardDescription>Vacation or an Emergency fund.</CardDescription>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-gray-500  font-bold text-lg"
                >
                  {goalAmount > 0 ? "Edit Goals" : "Create Goals"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Saving Goals</DialogTitle>
                  <DialogDescription>
                    Set or update your saving goal. By clicking <b>reseting</b>{" "}
                    button new goal created with current date
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goalAmount" className="text-right">
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
                <DialogFooter>
                  {goalAmount > 0 ? (
                    <Button onClick={handleResetGoal}>Reset</Button>
                  ) : (
                    ""
                  )}
                  <Button
                    type="submit"
                    onClick={handleSaveGoal}
                    disabled={loading}
                  >
                    {loading ? "Saving...." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="flex justify-between">
              <span>${saveData?.currentSave || 0}</span>
              <span>${goalAmount || 0}</span>
            </div>
            <Progress value={33} />
          </CardContent>
        </Card>
      </div>
      <div className="xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between pr-2 xl:pr-2">
        <div className="xl:w-1/2  w-full px-10 py-5 mt-10 border border-gray-600">
          <div className="flex justify-between">
            <div className="pb-2">
              <h2>Total Transaction</h2>
              <span>$1023</span>
            </div>
            <Select>
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
            <CustomLineChart />
          </div>
        </div>
        <div className="xl:w-1/2 w-full px-10 py-5 mt-10 border border-gray-600">
          <div className="flex justify-between">
            <div className="pb-2">
              <h2>Total Transaction</h2>
              <span>$1023</span>
            </div>
            <Select>
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
            <CustomBarChart />
          </div>
        </div>
      </div>
      <div className="xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between pr-2 xl:pr-2 mt-8">
        <div className="border border-gray-600 xl:w-1/2 w-full">
          <CustomPieChart />
        </div>
        <div className="border border-gray-600 xl:w-1/2 w-full">
          <LatestBudgetTable />
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
