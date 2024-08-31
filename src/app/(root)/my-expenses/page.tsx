"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useForm } from "react-hook-form";
import { expenseSchema } from "@/schemas/expenseSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineEdit } from "react-icons/ai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Expenses = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [date, setDate] = useState<Date>();
  const [budgetCategories, setBudgetCategories] = useState<any>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]); // State to store threads
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState<string | null>(null);
  const user: User = session?.user;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: "",
      category: "",
    },
  });

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
    }
  }, []);

  const fetchUserExpenses = useCallback(async () => {
    try {
      const response = await axios.get<any>("/api/expense/get-expenses", {
        params: {
          time: timeFilter,
          search: searchCategory,
          page: currentPage,
          limit: 5,
        },
      });

      if (response.data.success) {
        setExpenses(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching expenses details";
    }
  }, [timeFilter, searchCategory, currentPage]);

  useEffect(() => {
    if (session) {
      fetchUserBudgets();
      fetchUserExpenses();
    }
  }, [session, fetchUserBudgets, fetchUserExpenses]);

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/expense/create-expense",
        data
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      setIsSubmitting(false);

      if (response.data.success) {
        fetchUserExpenses();
      }
    } catch (error) {
      console.error("Error during expense creation:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your request. Please try again.";

      toast({
        title: "Create Expense Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await axios.delete(
        `/api/expense/delete-expense/${expenseId}`
      );
      if (response.data.success) {
        toast({
          title: "Delete Expense",
          description: response.data.message,
          variant: "default",
        });
        fetchUserExpenses();
      } else {
        toast({
          title: "Error deleting Expense",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting Expense", error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const year = date.getUTCFullYear();

    // Return the formatted date as '10/9/2024' (day/month/year)
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="py-10">
      <Card className="w-[350px] sm:w-[450px] md:w-[600px]  mx-auto lg:ml-20 border border-gray-200">
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>
            Add your expenses here. When adding an expense please select a
            category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <Input {...field} placeholder="Add a small description" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              const localDate = new Date(
                                selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
                              );
                              setDate(localDate);
                              field.onChange(localDate.toISOString().split("T")[0]); // Send only the date part (YYYY-MM-DD)
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          {budgetCategories?.categories?.map(
                            (category: any) => (
                              <SelectItem
                                key={category?._id}
                                value={category?.name}
                              >
                                {category?.name}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Create Expense"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mx-auto lg:ml-20 ml-5 px-8 lg:pr-4">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-20 pb-10 px-5 border-y border-blue-500">
          <div className="flex py-2 flex-col sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
            <div className="mt-2">
              <Select
                defaultValue=""
                onValueChange={(value) => setTimeFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Time" />
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
            </div>

            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search Category"
                value={searchCategory || ""}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
            </div>
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

                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4">{expense.category}</td>
                  <td className="px-6 py-4">${expense.amount}</td>

                  <td className="px-6 py-4 text-red-600">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <RiDeleteBin6Line
                          className="text-red-500 cursor-pointer"
                          size={20}
                        />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this expense and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExpense(expense?._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Previous
              </Button>
              <Button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="ml-3 bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page{" "}
                  <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="bg-gray-500 text-white px-4 py-2 rounded-l-md hover:bg-gray-600"
                  >
                    Previous
                  </Button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage}
                  </span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="bg-gray-500 text-white px-4 py-2 rounded-r-md hover:bg-gray-600"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
