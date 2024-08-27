"use client";

import BudgetCard from "@/components/BudgetCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { budgetCategory, invoices } from "@/constants";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { budgetSchema } from "@/schemas/budgetSchema";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { RiDeleteBin6Line } from "react-icons/ri";
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

const CreateCard = ({ fetchUserBudgets }: { fetchUserBudgets: () => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      limit: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof budgetSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/budget/create-budget",
        data
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      if (response.data.success) {
        fetchUserBudgets();
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error during sign-up:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ("There was a problem with your sign-up. Please try again.");

      toast({
        title: "Create Budget Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-[250px] h-[180px] m-5 flex justify-center items-center cursor-pointer">
          <CardContent>
            <Image
              src="/icons/plus.svg"
              alt="pic"
              width={30}
              height={30}
              className="w-12 h-8 mx-auto"
            />
            <p className="text-lg font-bold">Create New Budget</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="w-[350px] sm:w-[450px] md:w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            By creating new budget means creating new category of your expenses
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <Input
                      {...field}
                      placeholder="food, education"
                      name="name"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="limit"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget amount</FormLabel>
                    <Input
                      {...field}
                      name="limit"
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Create Budget"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MyBudget = () => {
  const [budgetCategories, setBudgetCategories] = useState<any>({});
  const { data: session } = useSession();
  const user: User = session?.user;
  const { toast } = useToast();

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

  useEffect(() => {
    if (session) {
      fetchUserBudgets();
    }
  }, [session, fetchUserBudgets]);

  const handleDeleteCategory = async (
    budgetId: string,
    categoryName: string
  ) => {
    try {
      const response = await axios.delete(
        `/api/budget/delete-budget/${budgetId}?name=${categoryName}`
      );
      if (response.data.success) {
        toast({
          title: "Delete category",
          description: response.data.message,
          variant: "default"
        });
        fetchUserBudgets(); // Refresh the budget categories after deletion
      } else {
        toast({
          title: "Error deleting category",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="flex flex-col pb-10">
      <h1 className="mx-auto lg:ml-10 lg:py-5 py-2 text-lg md:text-xl font-bold">
        Augest, 2024
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center items-center mx-auto">
        <CreateCard fetchUserBudgets={fetchUserBudgets} />
        {budgetCategories?.categories?.map((budget: any) => (
          <BudgetCard key={budget?._id} budget={budget} />
        ))}
      </div>

      <div className="mx-auto lg:ml-20 w-full px-10 md:w-[700px] lg:w-[800px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-20 pb-10 px-5 border-y border-blue-500">
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
                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {budgetCategories?.categories?.map((budget: any) => (
                <tr
                  key={budget._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{budget?.name}</td>
                  <td className="px-6 py-4">{budget?.spent}</td>
                  <td className="px-6 py-4">${budget?.limit}</td>
                  
                  <td className="px-6 py-4">
                    {/* <RiDeleteBin6Line size={20} />{" "} */}
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
                            delete this budget and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteCategory(budgetCategories?._id, budget?.name)
                            }
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
        </div>
      </div>
    </div>
  );
};

export default MyBudget;
// UTQ6PICYKBKGOV1R