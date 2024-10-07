"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SquareSplitHorizontal, Menu, X } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { ModeToggle } from "@/app/ModeToggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <header
        className={cn(
          "px-4 lg:px-6 h-16 flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white shadow-md dark:bg-black dark:shadow-green-900/20"
            : "bg-transparent"
        )}
      >
        <Link className="flex items-center" href="#">
          <SquareSplitHorizontal className="h-7 w-7 text-green-600" />
          <span className="ml-2 text-2xl font-bold text-green-600">
            SpendWise
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          {["Features", "Pricing", "About"].map((item) => (
            <Link
              key={item}
              className="text-sm font-medium hover:text-green-600 transition-colors"
              href="#"
            >
              {item}
            </Link>
          ))}
          <ModeToggle />
        </nav>
        <Button
          className="md:hidden"
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </header>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 bg-white dark:bg-black shadow-md z-40 md:hidden"
        >
          <nav className="flex flex-col p-4">
            <ModeToggle />
            {["Features", "Pricing", "About"].map((item) => (
              <Link
                key={item}
                className="py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors"
                href="#"
              >
                {item}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </>
  )
}