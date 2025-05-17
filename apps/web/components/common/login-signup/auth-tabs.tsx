"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { Toaster } from "@/components/ui/sonner";

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex flex-col space-y-6 w-full max-w-md mx-auto">
      <Toaster position="top-center" />

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome to PayrollPro</h1>
        <p className="text-muted-foreground">
          {activeTab === "login"
            ? "Sign in to your account to continue"
            : "Create a new account to get started"}
        </p>
      </div>

      <div className="bg-card border rounded-lg shadow-sm p-6">
        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
