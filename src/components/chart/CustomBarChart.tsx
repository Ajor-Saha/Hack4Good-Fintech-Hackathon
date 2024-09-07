"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

interface BarChartProps {
  range: string;
}

interface ChartData {
  name: string;
  expenses: number;
  savings: number;
}

// Custom tooltip component to display detailed information
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#36454F", padding: "10px", border: "1px solid #cccc" }}>
        <p className="label">{`Period: ${payload[0].payload.name}`}</p>
        <p>{`Expenses: $${payload[0].value}`}</p>
        <p>{`Savings: $${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomBarChart: React.FC<BarChartProps> = ({ range }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const fetchChartData = useCallback(async () => {
    try {
      const response = await axios.get<any>(`/api/dashboard-data/barChart-data?range=${range}`);
      if (response.data.success) {
        setChartData(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? "Error while fetching chart data";
      console.error(errorMessage);
    }
  }, [range]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="expenses" fill="#82ca9d" />
        <Bar dataKey="savings" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
