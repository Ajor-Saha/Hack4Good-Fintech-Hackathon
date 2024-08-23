'use client'

import CustomBarChart from "@/components/chart/CustomBarChart";
import CustomLineChart from "@/components/chart/CustomLineChart";
import CustomCard from "@/components/CustomCard";
import { Card } from "@/components/ui/card";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React from "react";

const Home = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
 
  return (
    <div className="ml-5 pb-10">
      <h1 className="text-2xl font-bold p-5 text-green-900">Hello, {user?.username}</h1>
      <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3  justify-items-center">
        <CustomCard />
        <CustomCard />
        <CustomCard />
        <CustomCard />
      </div>
      <div className="mt-10 gap-5 border-gray-400 xl:w-[1130px] flex flex-col lg:flex-row justify-between">
        <Card className="px-10 py-5">
          <CustomLineChart />
        </Card>
        <Card className="px-10 py-5 mt-5 lg:mt-0">
          <CustomBarChart />
        </Card>
      </div>
    </div>
  );
};

export default Home;
