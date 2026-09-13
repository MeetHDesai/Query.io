"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/AuthContext";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const { user } = useAuth();
  
  return (
    <section className={cn(
      "w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-black to-zinc-900",
      className
    )}>
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                Unlock Your Data with <span className="text-white">Natural Language</span>
              </h1>
              <p className="max-w-[600px] text-zinc-400 md:text-xl">
                QueryIO empowers non-technical users to interact with databases using simple, conversational
                language. No SQL knowledge required.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
                <Link href="/register">Try QueryIO Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800" asChild>
                <Link href="#demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-video overflow-hidden rounded-xl border border-zinc-800 shadow-xl lg:order-last">
            <Image
              src="/placeholder.svg?height=550&width=550"
              width={550}
              height={550}
              alt="QueryIO Dashboard Preview"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 