"use client";

import { Button } from "@/components/ui/button";
import { MdMoney, MdInsights, MdAccountBalance, MdTrendingUp, MdSavings, MdPieChart, MdSmartphone } from "react-icons/md";
import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "next-auth";
import { useSession } from "next-auth/react";

const features = [
    {
      icon: <MdAccountBalance className="w-8 h-8 text-blue-500" />,
      title: "Smart Budgeting",
      description: "Create and manage budgets with intelligent categorization and real-time tracking."
    },
    {
      icon: <MdPieChart className="w-8 h-8 text-purple-500" />,
      title: "Expense Analytics",
      description: "Visualize your spending patterns with interactive charts and detailed breakdowns."
    },
    {
      icon: <MdTrendingUp className="w-8 h-8 text-green-500" />,
      title: "Investment Tracking",
      description: "Stay updated with market trends and manage your investment portfolio efficiently."
    },
    {
      icon: <MdInsights className="w-8 h-8 text-amber-500" />,
      title: "AI-Powered Insights",
      description: "Receive personalized financial recommendations powered by advanced AI algorithms."
    },
    {
      icon: <MdSavings className="w-8 h-8 text-cyan-500" />,
      title: "Savings Goals",
      description: "Set and track your savings goals with visual progress indicators."
    },
    {
      icon: <MdSmartphone className="w-8 h-8 text-rose-500" />,
      title: "Smart Dashboard",
      description: "Access all your financial information in one elegant, user-friendly interface."
    }
  ];

export default function LandingPage() {
    const { data: session } = useSession();
    const user: User = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-3xl" />
        </div>
        
        <div className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center items-center space-x-3 mb-8">
                <MdMoney className="h-12 w-12 text-blue-500" />
                <h1 className="text-4xl font-bold text-white">WealthLens</h1>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Your Financial Future,
                <span className="text-blue-500"> In Focus</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Take control of your financial well-being with our comprehensive platform.
                Track expenses, manage investments, and achieve your savings goals with AI-driven insights.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {user ? (
                  <Link href="/">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-lg text-lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-lg text-lg">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              An all-in-one platform designed to help you make smarter financial decisions
              and achieve your financial goals with confidence.
            </p>
          </motion.div>
          
          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="absolute top-4 left-4">
                    {feature.icon}
                  </div>
                  <dt className="mt-8 text-xl font-semibold leading-7 text-white">
                    {feature.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-300">
                    {feature.description}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-xs leading-5 text-gray-400">
              © 2024 WealthLens. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}