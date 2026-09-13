import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Query.io",
  description: "Query.io Dashboard - Chat with your database",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
} 