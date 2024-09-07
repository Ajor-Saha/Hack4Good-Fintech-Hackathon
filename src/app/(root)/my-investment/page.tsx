"use client";
import MarketTrendChart from "@/components/chart/MarketTrendChart";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { stockData } from "@/constants";
import { stockSchema } from "@/schemas/stockSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RiDeleteBin6Line } from "react-icons/ri";
import { z } from "zod";

const timeAgo = (timestamp: number) => {
  const now = Date.now();
  const differenceInSeconds = Math.floor(now / 1000) - timestamp;

  const secondsInHour = 3600;
  const secondsInDay = 86400;

  if (differenceInSeconds < secondsInHour) {
    const minutes = Math.floor(differenceInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (differenceInSeconds < secondsInDay) {
    const hours = Math.floor(differenceInSeconds / secondsInHour);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(differenceInSeconds / secondsInDay);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
};

const MyInvestment = () => {
  const [investmentData, setInvestmentData] = useState<any>({});
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userStocks, setUserStocks] = useState<any>({});
  const [stockNews, setStockNews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const form = useForm<z.infer<typeof stockSchema>>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      symbol: "",
      price: 0,
      volume: 0,
    },
  });

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<any>("/api/investment/market-trends");
      if (response.data.success) {
        const result = response.data.data;
        if (result?.topGainers?.length > 0) {
          setInvestmentData(result);
        } else {
          setInvestmentData(stockData);
        }
      } else {
        toast({
          title: "Error getting stock data",
          description: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching stock details";
      toast({ description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUserStocks = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        "/api/investment/user-stocks"
      );
      if (response.data.success) {
        setUserStocks(response.data.data);
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      
    }
  }, [toast]);

  const fetchStockNews = useCallback(async () => {
    try {
      const response = await axios.get<any>(
        "/api/investment/stock-news" // Replace with your actual API endpoint
      );
      if (response.data.success) {
        const flattenedNews = response.data.data.flat();
        setStockNews(flattenedNews);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ?? "Error while fetching stock news";
      
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    fetchUserStocks();
    fetchStockNews();
  }, [fetchStockData, fetchUserStocks, fetchStockNews]);

  const onSubmit = async (data: z.infer<typeof stockSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/investment/create-stock", // Replace with your actual API endpoint
        data
      );

      if (response.data.success) {
        fetchUserStocks();
      }

      toast({
        title: "Success",
        description: response.data.message,
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error updating account details:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      let errorMessage =
        axiosError.response?.data.message ||
        "There was a problem creating new stock details. Please try again.";

      toast({
        title: "Adding stock details failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (symbol: string) => {
    try {
      const response = await axios.delete(
        `/api/investment/delete-stock/${symbol}`
      );
      if (response.data.success) {
        toast({
          title: "Delete Saved Stock",
          description: response.data.message,
          variant: "default",
        });
        fetchUserStocks();
      } else {
        toast({
          title: "Error deleting Expense",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting Stock", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNewsItems = stockNews.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="py-10 flex flex-col">
      <div className="px-10 xl:w-[1130px] gap-5 w-full flex flex-col xl:flex-row justify-between my-8">
        <div className="xl:w-1/2 border border-gray-600 px-5  w-full ">
          <MarketTrendChart investmentData={investmentData} />
        </div>
        <div className="xl:w-1/2 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Add New Stock Details</CardTitle>
              <CardDescription>
                You may invest on various stock. Here you can add those stocks
                details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="symbol"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="symbol">Stock Symbol</Label>
                        <Input {...field} placeholder="HYZNW..." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="volume"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="volume">Volume of Stock</Label>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
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
                      "Submit"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex flex-col px-10 gap-5">
        <h1 className="text-lg xl:text-xl font-extrabold text-gray-400">
          Stock Market Trends Data with Real-Time Analysis and Detailed Overview
        </h1>
        <p className="bg-gray-700 p-5 rounded-xl">
          This Feature route provides a comprehensive view of the latest stock
          market trends, including top gainers, losers, and most active stocks.
          By analyzing real-time data, it highlights key market movements and
          offers a detailed overview of each stock, including essential
          information like Symbol, AssetType, Name, Currency, Country, Sector,
          Industry, Address, and Official Website. This feature empowers users
          to make informed investment decisions based on up-to-date market
          performance.
        </p>
      </div>
      <div className="flex m-10 flex-col bg-gray-700 rounded-xl">
        <h1 className="lg:text-lg font-bold dark:text-gray-400 p-5">
          Your Invested Stock Related News
        </h1>
        <div>
          {currentNewsItems.length > 0 ? (
            currentNewsItems.map((newsItem, index) => (
              <div key={index} className="p-5 border-b border-gray-600">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold">
                    {newsItem?.headline}
                  </h2>
                  <Image
                    src={newsItem?.image}
                    alt="not available"
                    width={50}
                    height={50}
                    className="w-20 h-16"
                  />
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-400">
                    {timeAgo(newsItem.datetime)}
                  </p>
                  <p className="text-sm">{newsItem?.related}</p>
                </div>
                <div className="flex gap-5">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-blue-400">Read more</button>
                    </DialogTrigger>
                    <DialogContent className="w-full">
                      <DialogHeader>
                        <DialogTitle className="py-5">
                          {newsItem?.headline}
                        </DialogTitle>
                        <DialogDescription>
                          <div className="flex flex-col gap-5">
                            <Image
                              src={newsItem?.image}
                              alt="pic"
                              width={100}
                              height={100}
                              className="w-full h-[180px] rounded-sm"
                            />
                            <p>{newsItem?.summary}</p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-between">
                        <p>
                          <b>Related Stock : </b>
                          {newsItem?.related}
                        </p>
                        <a
                          href={newsItem?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Source Link
                        </a>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <a
                    href={newsItem?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Source
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="px-10 text-center text-sm">
              No Stock News available for you. Add your new Stock Details
            </p>
          )}
        </div>
        <div className="flex justify-between p-5">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={indexOfLastItem >= stockNews.length}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="px-10 py-10 flex justify-center items-center md:justify-start">
        <Tabs defaultValue="topGainers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topGainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="topLosers">Top Losers</TabsTrigger>
            <TabsTrigger value="yourStock">Your Stocks</TabsTrigger>
          </TabsList>
          <TabsContent value="topGainers">
            <div className="w-full mt-5">
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg py-8 px-5 border-y border-blue-500">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Stock(ticker)
                      </th>
                      <th scope="col" className="px-6 py-3">
                        price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        volume
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <div className="flex justify-center items-center mt-5">
                        <Loader className="ml-48 h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      investmentData?.topGainers?.map(
                        (stock: any, index: number) => (
                          <tr
                            key={index}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="px-6 py-4">{stock?.ticker}</td>
                            <td className="px-6 py-4">${stock?.price}</td>
                            <td className="px-6 py-4">{stock?.volume}</td>
                            <td className="px-6 py-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <p className="text-blue-400 cursor-pointer">
                                    Details
                                  </p>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {stock?.ticker} Stock
                                    </DialogTitle>
                                    <DialogDescription>
                                      Here is Details about this stock. Include
                                      stock name, company name, address etc
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex gap-5">
                                      <b>Stock Name: </b>{" "}
                                      <p>{stock?.details.Name}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock Symbol: </b>{" "}
                                      <p>{stock?.details.Symbol}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock AssetType: </b>{" "}
                                      <p>{stock?.details.AssetType}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock Industry: </b>{" "}
                                      <p>{stock?.details.Industry}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock County: </b>{" "}
                                      <p>{stock?.details.Country}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock Currency: </b>{" "}
                                      <p>{stock?.details.Currency}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock Sector: </b>{" "}
                                      <p>{stock?.details.Sector}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock Address: </b>{" "}
                                      <p>{stock?.details.Address}</p>
                                    </div>
                                    <div className="flex gap-5">
                                      <b>Stock OfficialSite: </b>{" "}
                                      <a
                                        href={stock?.details.OfficialSite}
                                        target="blank"
                                        className="underline text-blue-600"
                                      >
                                        Official Website
                                      </a>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </td>
                            <td className="px-6 py-4 text-red-400">
                              <a
                                href={`https://finance.yahoo.com/quote/${stock?.ticker}`}
                                target="blank"
                              >
                                Live
                              </a>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="topLosers">
            <div className="w-full mt-5">
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg py-8 px-5 border-y border-blue-500">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Stock(ticker)
                      </th>
                      <th scope="col" className="px-6 py-3">
                        price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        volume
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentData?.topLosers?.map(
                      (stock: any, index: number) => (
                        <tr
                          key={index}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4">{stock?.ticker}</td>
                          <td className="px-6 py-4">${stock?.price}</td>
                          <td className="px-6 py-4">{stock?.volume}</td>
                          <td className="px-6 py-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <p className="text-blue-400 cursor-pointer">
                                  Details
                                </p>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    {stock?.ticker} Stock
                                  </DialogTitle>
                                  <DialogDescription>
                                    Here is Details about this stock. Include
                                    stock name, company name, address etc
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-3 text-sm">
                                  <div className="flex gap-5">
                                    <b>Stock Name: </b>{" "}
                                    <p>{stock?.details.Name}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock Symbol: </b>{" "}
                                    <p>{stock?.details.Symbol}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock AssetType: </b>{" "}
                                    <p>{stock?.details.AssetType}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock Industry: </b>{" "}
                                    <p>{stock?.details.Industry}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock County: </b>{" "}
                                    <p>{stock?.details.Country}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock Currency: </b>{" "}
                                    <p>{stock?.details.Currency}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock Sector: </b>{" "}
                                    <p>{stock?.details.Sector}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock Address: </b>{" "}
                                    <p>{stock?.details.Address}</p>
                                  </div>
                                  <div className="flex gap-5">
                                    <b>Stock OfficialSite: </b>{" "}
                                    <a
                                      href={stock?.details.OfficialSite}
                                      target="blank"
                                      className="underline text-blue-600"
                                    >
                                      Official Website
                                    </a>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </td>
                          <td className="px-6 py-4 text-red-400">
                            <a
                              href={`https://finance.yahoo.com/quote/${stock?.ticker}`}
                              target="blank"
                            >
                              Live
                            </a>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="yourStock">
            <div className="w-full mt-5">
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg py-8 px-5 border-y border-blue-500">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Stock(Symbol)
                      </th>
                      <th scope="col" className="px-6 py-3">
                        price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        volume
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStocks?.stocks?.length > 0 ? (
                      userStocks?.stocks?.map((stock: any, index: number) => (
                        <tr
                          key={stock?._id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4">{stock?.symbol}</td>
                          <td className="px-6 py-4">${stock?.price}</td>
                          <td className="px-6 py-4">{stock?.volume}</td>
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
                                    This action cannot be undone. This will
                                    permanently delete your saved stock detalis
                                    and remove your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteStock(stock?.symbol)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-center text-sm dark:text-gray-50"
                        >
                          Your Investment stock details display here. Add your
                          invested stock details
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyInvestment;
