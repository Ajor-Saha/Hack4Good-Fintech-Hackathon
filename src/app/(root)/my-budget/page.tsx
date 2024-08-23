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

const CreateCard = () => {
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
  

  return (
    <div className="flex flex-col pb-10">
      <h1 className="mx-auto lg:ml-10 lg:py-5 py-2 text-lg md:text-xl font-bold">
        Augest, 2024
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center items-center mx-auto">
        <CreateCard />
        {budgetCategories?.categories?.map((budget: any) => (
          <BudgetCard key={budget?._id} budget={budget} />
        ))}
      </div>
    </div>
  );
};

export default MyBudget;
