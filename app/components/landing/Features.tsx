"use client";

import { Shield, MessageSquare, Database, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesProps {
  className?: string;
}

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    title: "Natural Language Queries",
    description: "Ask questions in plain English and get accurate database results instantly.",
  },
  {
    icon: <Database className="h-6 w-6 text-white" />,
    title: "Multi-Database Support",
    description: "Connect to MySQL, PostgreSQL, MongoDB, and more with seamless integration.",
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-white" />,
    title: "Data Visualization",
    description: "Automatically generate charts and graphs from your query results.",
  },
  {
    icon: <Shield className="h-6 w-6 text-white" />,
    title: "Secure Access",
    description: "Enterprise-grade security with role-based permissions and data encryption.",
  },
];

export function Features({ className }: FeaturesProps) {
  return (
    <section id="features" className={cn("w-full py-12 md:py-24 lg:py-32 bg-zinc-900", className)}>
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
              Powerful Features, Simple Interface
            </h2>
            <p className="max-w-[900px] text-zinc-400 md:text-xl">
              QueryIO combines advanced AI with an intuitive interface to make database querying accessible to
              everyone.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700"
            >
              <div className="rounded-full bg-zinc-800 p-3">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-center text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 