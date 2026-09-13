"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TestimonialsProps {
  className?: string;
}

export function Testimonials({ className }: TestimonialsProps) {
  return (
    <section id="testimonials" className={cn("w-full py-12 md:py-24 lg:py-32 bg-zinc-900", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
              Trusted by Data Teams Everywhere
            </h2>
            <p className="max-w-[900px] text-zinc-400 md:text-xl">
              See what our customers have to say about how QueryIO has transformed their workflow.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
              </div>
              <p className="text-zinc-300">
                "QueryIO has democratized data access across our organization. Our marketing team can now get
                insights without waiting for the data team, saving us countless hours each week."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="Jennifer Lee"
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Jennifer Lee</p>
                <p className="text-xs text-zinc-400">CMO, TechGrowth</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
              </div>
              <p className="text-zinc-300">
                "As a data analyst, I was skeptical about AI-generated SQL. But QueryIO's accuracy is impressive,
                and it's helped me focus on analysis rather than writing repetitive queries."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="Marcus Johnson"
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Marcus Johnson</p>
                <p className="text-xs text-zinc-400">Senior Data Analyst, DataDrive</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
              </div>
              <p className="text-zinc-300">
                "We integrated QueryIO with our customer support platform, and now our support team can instantly
                access customer data without learning SQL. Game changer for our response times."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                width={40}
                height={40}
                alt="Sophia Rodriguez"
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Sophia Rodriguez</p>
                <p className="text-xs text-zinc-400">CTO, SupportHero</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 