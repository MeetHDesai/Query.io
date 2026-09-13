"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";

// You can replace this with your actual logo component or SVG
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg focus:outline-none focus-visible:ring-2 ring-accent">
      <span className="sr-only">Home</span>
      {/* Example logo SVG */}
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="6" fill="#22C55E" />
        <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      QueryIO
    </Link>
  );
}

export function Nav() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <nav className="w-full bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Logo />
      </div>
      {/* Center: Nav links */}
      <div className="hidden md:flex gap-6 text-gray-300 text-sm font-medium">
        <Link href="#features" className="hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 ring-accent transition-colors">Features</Link>
        <Link href="#community" className="hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 ring-accent transition-colors">Community</Link>
        <Link href="https://ui.shadcn.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 ring-accent transition-colors">Docs</Link>
      </div>
      {/* Right: CTA Button */}
      <div className="flex items-center gap-2">
        <Button asChild className="bg-accent text-white px-5 py-2 font-semibold rounded-md shadow hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent focus:outline-none transition-colors">
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            Get Started
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Nav;
