"use client"

import { AuthProvider } from "@/app/contexts/AuthContext";
import React from "react";
import { Toaster } from "@/components/ui/sonner"; 

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <AuthProvider>
      {children}
      <Toaster /> 
    </AuthProvider>
  );
}