import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { chartdata } from '@/constants';

const CustomBarChart = () => {
  // Handle cases where chartdata might be undefined or null
  if (!chartdata || chartdata.length === 0) {
    return <p>No data available to display the chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartdata}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pv" stackId="a" fill="#8884d8" />
        <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CustomBarChart;
