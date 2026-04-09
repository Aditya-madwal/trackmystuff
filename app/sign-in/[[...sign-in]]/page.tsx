"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center font-bold text-accent text-lg">
            N
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Nexus
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your learning dashboard
          </p>
        </div>

        {/* Clerk Sign-In */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "w-full shadow-none border border-border/40 rounded-lg bg-card",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
