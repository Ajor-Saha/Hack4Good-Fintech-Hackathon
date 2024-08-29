"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

interface CustomCardProps {
  title: string;
  amount: number;
  description: string;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  amount,
  description,
}) => {
  const [expenseAmount, setExpenseAmount] = useState<number | null>(amount);
  const [selectedTime, setSelectedTime] = useState<string | null>( "last 30 days");

  const fetchData = useCallback(
    async (timeFilter: string) => {
      try {
        const response = await axios.get<any>(
          `/api/dashboard-data/dashboard-inside?title=${title}&time=${timeFilter}`
        );
        if (response.data.success) {
          setExpenseAmount(response.data.data);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        let errorMessage =
          axiosError.response?.data.message ??
          "Error while fetching user details";
      }
    },
    [title]
  );

  useEffect(() => {
    if (selectedTime) {
      fetchData(selectedTime);
    }
  }, [selectedTime, fetchData]);

  return (
    <Card className="w-[250px] flex flex-col justify-between h-[180px] mx-auto mb-5">
      <CardHeader>
        <CardDescription>{description} {selectedTime}.</CardDescription>
        <CardTitle>
          {expenseAmount !== null
            ? title === "Items"
              ? `${expenseAmount}`
              : `$${expenseAmount}`
            : "0"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between gap-7">
        <span className="mt-2">{title}</span>
        <Select  onValueChange={(value) => setSelectedTime(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Time</SelectLabel>
              <SelectItem value="last 7 days">Last 7 days</SelectItem>
              <SelectItem value="last 30 days">Last 30 days</SelectItem>
              <SelectItem value="last month">Last month</SelectItem>
              <SelectItem value="last 6 months">Last 6 months</SelectItem>
              <SelectItem value="last year">Last year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default CustomCard;

/*
Saving money for this moth

Total Expense 

Latest Total Budget
 */
