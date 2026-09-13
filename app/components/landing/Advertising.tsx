"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { User } from "lucide-react";

interface AdvertisingProps {
  className?: string;
}

const companies = [
  { name: "Company 1", logo: "/placeholder.svg" },
  { name: "Company 2", logo: "/placeholder.svg" },
  { name: "Company 3", logo: "/placeholder.svg" },
  { name: "Company 4", logo: "/placeholder.svg" },
  { name: "Company 5", logo: "/placeholder.svg" },
  { name: "Company 6", logo: "/placeholder.svg" },
];

interface TestimonialsProps {
  className?: string;
}

const testimonials = [
  {
    quote: "Query.io has revolutionized how our analysts interact with data. No SQL required!",
    author: "Sarah Johnson",
    position: "Data Team Lead, TechCorp",
  },
  {
    quote: "We've reduced our data request turnaround time by 70% since adopting Query.io.",
    author: "Michael Chen",
    position: "Marketing Director, GrowthLabs",
  },
  {
    quote: "The ability to query our database in plain English has democratized data access across our entire organization.",
    author: "Jessica Smith",
    position: "CEO, DataFirst",
  },
  {
    quote: "Our non-technical staff can now get the data insights they need without waiting for the data team.",
    author: "Thomas Wilson",
    position: "Product Manager, Innovate Inc",
  },
];

export function Advertising({ className }: AdvertisingProps) {
  return (
    <section className={cn("w-full py-16", className)}>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Trusted by Teams Everywhere</h2>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card p-6 rounded-lg">
              <blockquote className="text-lg italic mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div className="font-medium">{testimonial.author}</div>
              <div className="text-sm text-muted-foreground">{testimonial.position}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ className }: TestimonialsProps) {
  return (
    <section className={cn("w-full py-20", className)}>
      <div className="flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-[#1A1A1A] p-6 rounded-lg border border-[#1E1E1E] hover:border-accent transition-colors duration-200"
            >
              <div className="flex items-start mb-4">
                <div className="mr-4 bg-[#222222] p-2 rounded-full">
                  <User className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <blockquote className="text-lg mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 