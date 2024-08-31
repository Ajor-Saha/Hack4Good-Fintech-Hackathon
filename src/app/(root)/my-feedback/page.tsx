"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import ReactMarkdown, { Components } from 'react-markdown';




const MyFeedBack = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/feedback", {
        startDate,
        endDate,
      });

      if (response.data.success) {
        setFeedback(response.data.data);
        toast({
          title: "Success",
          description: response.data.message,
        });
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error during expense creation:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your request. Please try again.";

      toast({
        title: "Failed getting Feedback",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  const customComponents: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-xl mb-2 font-bold text-gray-300" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-lg mb-1 font-semibold text-gray-300" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-md font-medium py-1 text-gray-300" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-gray-300 py-1 leading-relaxed" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside text-gray-300 mb-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-300 py-3" {...props} />
    ),
  };

  return (
    <div className="py-10 flex flex-col">
      <div className="flex flex-col px-10 gap-5">
        <h1 className="text-lg xl:text-xl font-extrabold text-gray-400">
          AI-Powered Personalized Expense Optimization
        </h1>
        <p className="bg-gray-700 p-5 rounded-xl">
          Leverage AI to provide users with tailored recommendations for
          optimizing their expense allocation, helping them achieve their
          savings goals efficiently. This feature analyzes users financial data
          and offers actionable insights to improve their budgeting strategies.
        </p>
      </div>
      <div className="mt-10 px-10">
        <Card className="w-full lg:w-[600px]">
          <CardHeader>
            <CardTitle>Get Feedback</CardTitle>
            <CardDescription>
              Get Personalized Expense Feedback in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <CardFooter className="flex justify-end mt-3 ml-6 w-full">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="my-10 px-10">
        <div className="bg-gray-700 py-5 px-5 rounded-xl">
          <h1 className="text-gray-300 font-semibold">
            Your Personalized Expense Feeback are here
          </h1>

          {feedback && (
            <>
              <div>
                <h2 className="text-lg text-gray-300 font-semibold">
                  Income Overview:
                </h2>
                <ul className="list-disc list-inside text-gray-300">
                  <li>Monthly Salary: {feedback.monthlySalary}</li>
                  <li>Current Savings: {feedback.currentSave}</li>
                  <li>Savings Goal: {feedback.goalAmount}</li>
                </ul>
              </div>
              <div className="mt-4">
                <h2 className="text-lg text-gray-300 font-semibold">
                  Expense Analysis:
                </h2>
                <ul className="list-disc list-inside text-gray-300">
                  {feedback?.expensesByCategory?.map(
                    (expense: any, index: number) => (
                      <li key={index}>
                        {expense._id}: ${expense.totalAmount}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <ReactMarkdown components={customComponents}>
                  {feedback.recommendations}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyFeedBack;
