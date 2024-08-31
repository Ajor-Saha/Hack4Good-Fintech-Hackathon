'use client'

import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

interface LineChartProps {
  range : string
}

const CustomLineChart: React.FC<LineChartProps> = ({ range }) => {
  const [chartData, setChartData] = useState([]);

  const fetchLineChartData = useCallback(async () => {
    try {
      const response = await axios.get<any>(`/api/dashboard-data/lineChart-data?range=${range}`);
      if (response.data.success) {
        setChartData(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
    }
  }, [range]);
  
  useEffect(() => {
    fetchLineChartData()
  }, [fetchLineChartData]);

  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="expenses" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default CustomLineChart;
