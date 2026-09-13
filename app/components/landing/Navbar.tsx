"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle } from "@/components/ui/sheet";

export function Navbar1() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/placeholder.svg?height=32&width=32"
            alt="QueryIO Logo"
            width={32}
            height={32}
            className="rounded bg-white"
          />
          <span className="text-xl font-bold text-white">QueryIO</span>
        </div>

        {/* Mobile menu button */}
        <div className="block md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Testimonials
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Contact
          </Link>

          <Button
            asChild
            variant="outline"
            className="ml-2 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-white text-black hover:bg-gray-200">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>

        {/* Mobile Menu using Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden text-white" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-zinc-900 border-zinc-800">
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 py-4">
              <Link href="#features" className="text-white hover:text-zinc-400">
                Features
              </Link>
              <Link href="#testimonials" className="text-white hover:text-zinc-400">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-white hover:text-zinc-400">
                Pricing
              </Link>
              <Link href="#about" className="text-white hover:text-zinc-400">
                About
              </Link>
              <Link href="#contact" className="text-white hover:text-zinc-400">
                Contact
              </Link>
              <Link href="/login" className="text-white hover:text-zinc-400">
                Login
              </Link>
            </nav>
            <SheetFooter>
              <Button asChild className="w-full bg-white text-black hover:bg-gray-200">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}