import React from "react";
import { Button } from "./ui/button";

const LatestExpenseTable = () => {
  return (
    <div className="flex flex-col p-5 bg-gray-50 dark:bg-gray-700">
      <div className="flex justify-between border-b border-gray-400">
        <span className="text-sm mt-2 text-gray-300">Recent Expenses</span>
        <Button variant="outline" className="mb-2">See All</Button>
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
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    </div>
  );
};

export default LatestExpenseTable;
