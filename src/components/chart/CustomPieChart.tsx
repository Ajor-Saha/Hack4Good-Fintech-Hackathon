"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
import { months } from "@/constants";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PieChartCom: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const CustomPieChart: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    months[new Date().getMonth()]
  );
  const [data, setData] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);

  const fetchPieChartData = useCallback(async () => {
    try {
      const response = await axios.get<any>(
        `/api/dashboard-data/pieChart-data?time=${selectedMonth}`
      );
      if (response.data.success) {
        setTotalExpense(response.data.data?.totalExpense);
        setData(response.data.data?.chartData);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching dashboard data";
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPieChartData();
  }, [fetchPieChartData]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between pt-2 px-2">
        <div className="flex flex-col">
          <h3 className="font-semibold dark:text-gray-400">
           Total Transaction, {selectedMonth}
          </h3>
          <span>  ${totalExpense.toFixed(2)} </span>
        </div>
        <Select onValueChange={(value) => setSelectedMonth(value)}>
          <SelectTrigger className="w-[130px] md:w-[150px] lg:w-[140px]">
            <SelectValue placeholder="Select a Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Time Range</SelectLabel>
              {months?.map((month: string, index: number) => (
                <SelectItem key={index} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <PieChartCom data={data} />
    </div>
  );
};

export default CustomPieChart;
