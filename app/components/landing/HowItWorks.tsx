"use client";

import { cn } from "@/lib/utils";

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn("w-full py-12 md:py-24 lg:py-32 bg-black", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
              From Natural Language to Database Results
            </h2>
            <p className="max-w-[900px] text-zinc-400 md:text-xl">
              See how QueryIO transforms your questions into powerful database queries.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="ml-2 text-sm font-medium text-zinc-400">QueryIO Interface</div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-800 p-4">
                  <p className="font-medium text-white">
                    "Show me all customers who spent more than $1000 last month"
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-px flex-1 bg-zinc-700"></div>
                  <span className="mx-2 text-xs text-zinc-500">QueryIO AI translates to SQL</span>
                  <div className="h-px flex-1 bg-zinc-700"></div>
                </div>
                <div className="rounded-lg bg-zinc-950 p-4 text-zinc-300 font-mono text-sm">
                  <p>
                    {`SELECT c.name, c.email, SUM(o.total) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.order_date >= '2023-04-01' AND o.order_date <= '2023-04-30'
GROUP BY c.id
HAVING total_spent > 1000
ORDER BY total_spent DESC;`}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-px flex-1 bg-zinc-700"></div>
                  <span className="mx-2 text-xs text-zinc-500">Results</span>
                  <div className="h-px flex-1 bg-zinc-700"></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">John Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">john@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$2,450.00</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          Sarah Johnson
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">sarah@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$1,875.50</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Michael Chen</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">michael@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$1,340.25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 