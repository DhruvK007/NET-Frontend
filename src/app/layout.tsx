"use client"

import { Poppins } from "next/font/google"
import Link from "next/link"
import { Toaster } from "sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/provider/ThemeProvider"
import { AuthProvider } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"


const poppins = Poppins({ subsets: ["latin"], weight: "400" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(`scrollbar-hide`, poppins.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
              <Navbar />
              <main className="pt-16 flex-grow">{children}</main>
              <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  © 2024 SpendWise. All rights reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                  <Link
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline hover:text-gray-500 dark:hover:text-gray-400"
                    href="#"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline hover:text-gray-500 dark:hover:text-gray-400"
                    href="#"
                  >
                    Privacy
                  </Link>
                </nav>
              </footer>
            </div>
            <Toaster richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}