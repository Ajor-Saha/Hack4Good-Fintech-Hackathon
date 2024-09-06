"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useRouter } from "next/navigation";

const LatestExpenseTable = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const router = useRouter();

  const fetchUserExpenses = useCallback(async () => {
    try {
      const response = await axios.get<any>("/api/expense/get-expenses", {
        params: {
          page: 1,
          limit: 5,
        },
      });

      if (response.data.success) {
        setExpenses(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching expenses details";
    }
  }, []);

  useEffect(() => {
    fetchUserExpenses();
  }, [fetchUserExpenses]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const year = date.getUTCFullYear();

    // Return the formatted date as '10/9/2024' (day/month/year)
    return `${day}/${month}/${year}`;
  };

  const handleSeeAll = (route:string) => {
    router.push(route);
  }

  return (
    <div className="flex flex-col p-5 bg-gray-50 dark:bg-gray-700">
      <div className="flex justify-between border-b border-gray-400">
        <span className="text-sm mt-2 text-gray-300 font-bold">
          Recent Expenses
        </span>
        <Button variant="outline" onClick={() => handleSeeAll("/my-expenses")} className="mb-2 dark:text-blue-600">
          See All
        </Button>
      </div>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Category
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">{formatDate(expense.date)}</td>
                <td className="px-6 py-4">{expense.category}</td>
                <td className="px-6 py-4">${expense.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center dark:text-gray-50">
                No expense avaible. Add new Expense details
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LatestExpenseTable;
