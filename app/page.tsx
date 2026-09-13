"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname(); // so we only redirect from “/”
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // only run this logic when we're still on the root path
    if (pathname !== "/") return;

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/landing");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-white">Loading...</p>
      </div>
    </div>
  );
}
