'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  CreditCard,
  Users,
  Sparkles,
  IndianRupee,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function Page() {
  const [savings, setSavings] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setSavings((prev) => (prev + 10) % 1000)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <section className="w-full md:py-24 lg:py-32 xl:py-48 bg-green-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold tracking-tighter text-green-600 sm:text-4xl md:text-5xl lg:text-6xl/none">
                Split Expenses Effortlessly
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl dark:text-gray-300">
                SpendWise makes it easy to track and split expenses with your
                friends, roommates, or travel buddies.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-x-4"
            >
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-6 py-3"
                onClick={() => router.push("/login")}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Learn More
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-green-600 mb-2">
                SpendWise Community Savings
              </h3>
              <div className="flex items-center justify-center">
                <IndianRupee className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-4xl font-bold text-green-600">
                  {savings.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Join our community and start saving today!
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-gray-900 dark:text-white">
            Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: PieChart,
                title: "Easy Expense Tracking",
                description:
                  "Log expenses quickly and categorize them for better financial management.",
              },
              {
                icon: Users,
                title: "Group Splitting",
                description:
                  "Create groups for trips, households, or events and split costs fairly.",
              },
              {
                icon: CreditCard,
                title: "Settle Up",
                description:
                  "See who owes what and settle debts easily within the app.",
              },
              {
                icon: Sparkles,
                title: "Smart Suggestions",
                description:
                  "Get AI-powered insights on your spending habits and saving opportunities.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full dark:bg-gray-900 hover:shadow-lg transition-shadow duration-300 dark:border-none">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-green-600 mb-2" />
                    <CardTitle className="text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-green-600">
                Start Splitting Today
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300">
                Join thousands of users who trust SpendWise for hassle-free
                expense splitting.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-6 py-3"
                onClick={() => router.push("login")}
              >
                Sign Up Now
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                { number: "1M+", label: "Active Users" },
                { number: "₹50M+", label: "Expenses Tracked" },
                { number: "4.8/5", label: "App Store Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-3xl font-bold text-green-600">
                    {stat.number}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}