"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function EmailVerificationPage() {
  const { user, isLoading, sendVerificationEmail, refreshUserData, logout } = useAuth();
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [refreshStatus, setRefreshStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  // If user is verified or not logged in, redirect appropriately
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (user.emailVerified) {
        // Already verified, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const handleResendVerification = async () => {
    setResendStatus("loading");
    setError("");
    
    try {
      await sendVerificationEmail();
      setResendStatus("success");
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      setError(
        error.code === "auth/too-many-requests"
          ? "Too many verification emails sent recently. Please try again later."
          : "Failed to send verification email. Please try again."
      );
      setResendStatus("error");
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshStatus("loading");
    setError("");
    
    try {
      await refreshUserData();
      setRefreshStatus("success");
      
      // If user is verified after refresh, redirect to dashboard
      if (user?.emailVerified) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setError("Failed to refresh verification status. Please try again.");
      setRefreshStatus("error");
    }
  };

  // If still loading or being redirected, show minimal UI
  if (isLoading || !user || user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-md">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground">
            We've sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link.
          </p>
        </div>

        {resendStatus === "success" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p>Verification email has been resent. Please check your inbox.</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleRefreshStatus}
            variant="outline"
            className="w-full"
            disabled={refreshStatus === "loading"}
          >
            {refreshStatus === "loading" ? "Checking..." : "I've verified my email"}
          </Button>
          
          <Button
            onClick={handleResendVerification}
            variant="ghost"
            className="w-full"
            disabled={resendStatus === "loading"}
          >
            {resendStatus === "loading" ? "Sending..." : "Resend verification email"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/dashboard" className="text-primary hover:underline">
              Skip for now
            </Link>
            <span className="mx-2">•</span>
            <button 
              onClick={() => logout()} 
              className="text-primary hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 