import React, { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { stockData } from "@/constants";
import { useToast } from "../ui/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type StockItem = {
  ticker: string;
  price: string;
  volume: string;
  details: {
    Symbol?: string;
    AssetType?: string;
    Name?: string;
    Currency?: string;
    Country?: string;
    Sector?: string;
    Industry?: string;
    Address?: string;
    OfficialSite?: string;
  };
};

type StockData = {
  topGainers: StockItem[];
  topLosers: StockItem[];
  mostActive: StockItem[];
};

type StockCategory = keyof StockData;

// Process data for the chart
const processData = (
  data: StockItem[]
): { name: string; price: number; volume: number }[] => {
  return data?.map((item) => ({
    name: item.ticker,
    price: parseFloat(item.price),
    volume: parseInt(item.volume, 10),
  }));
};

// Custom Tooltip Component
const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any;
  }) => {
    if (active && payload && payload.length) {
      const { name, price, volume } = payload[0].payload;
      return (
        <div className="custom-tooltip text-slate-200 bg-gray-700 p-2 border rounded">
          <p className="label">Ticker: {name}</p>
          <p className="intro">Price: ${price}</p>
          <p className="desc">Volume: {volume}</p>
        </div>
      );
    }
  
    return null;
  };

  const formatYAxisTick = (value: any) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };


// Line chart component
const MarketLineChart: React.FC<{
  data: { name: string; price: number; volume: number }[];
}> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatYAxisTick} />
        <Tooltip content={CustomTooltip} />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="volume" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Main component
const MarketTrendChart: React.FC<{ investmentData: StockData }> = ({
  investmentData,
}) => {

  const [stockCategory, setStockCategory] = useState<StockCategory>("topGainers");

  // Ensure that the data is processed correctly based on the selected category
  const chartData = processData(investmentData[stockCategory]);
 

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between py-5 px-2">
        <div className="text-sm">Market Trends (Top Gainers and Top Losers )Stock Chart</div>
        <Select
          onValueChange={(value) => setStockCategory(value as StockCategory)}
        >
          <SelectTrigger className="w-[130px] md:w-[150px] lg:w-[140px]">
            <SelectValue placeholder="Select a Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Stock</SelectLabel>
              <SelectItem value="topGainers">Top Gainers</SelectItem>
              <SelectItem value="topLosers">Top Losers</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <MarketLineChart  data={chartData} />
    </div>
  );
};

export default MarketTrendChart;
