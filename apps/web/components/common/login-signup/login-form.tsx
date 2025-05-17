"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login, googleLogin } from "@/api/services/auth.service";
import { useAuthStore } from "@/api/store/auth.store";
import { ApiError } from "@/api/types";
import { decodeJwt } from "@/lib/jwt-helper";

// Define form schema with Zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

// Add type for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin } = useAuthStore();
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Load Google Identity Services
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && !googleButtonRendered) {
        // Log the Client ID being used
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        console.log("Using Google Client ID for login:", clientId);

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const googleButtonContainer = document.getElementById(
          "google-login-button"
        );
        if (googleButtonContainer) {
          window.google.accounts.id.renderButton(googleButtonContainer, {
            theme: "outline",
            size: "large",
            width: 240,
            text: "signin_with",
            type: "standard",
          });
          setGoogleButtonRendered(true);
        }
      }
    };

    return () => {
      // Clean up
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [googleButtonRendered]);

  // Handle Google callback
  const handleGoogleCallback = async (response: any) => {
    try {
      setIsLoading(true);
      if (response.credential) {
        // Log token for debugging (only the first few characters)
        const tokenPreview = response.credential.substring(0, 20) + "...";
        console.log("Google credential received (preview):", tokenPreview);

        // Decode the JWT token to check the payload without verification
        const decodedToken = decodeJwt(response.credential);
        console.log("Decoded token payload:", decodedToken);
        if (decodedToken?.aud) {
          console.log("Token audience:", decodedToken.aud);
        }

        try {
          // Send the credential to your backend
          const apiResponse = await googleLogin(response.credential);

          if (apiResponse.success && apiResponse.token && apiResponse.data) {
            toast.success("Google login successful");
            storeLogin(apiResponse.data, apiResponse.token);

            // Redirect based on whether user has an organization
            if (
              !apiResponse.data.has_organization ||
              apiResponse.data.org_count === 0
            ) {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          } else {
            console.error("API Response Error:", apiResponse);
            toast.error("Login failed: Invalid API response");
          }
        } catch (apiError: any) {
          console.error("API Error Details:", {
            message: apiError.message,
            status: apiError.status,
            stack: apiError.stack,
            fullError: JSON.stringify(apiError),
          });
          toast.error(
            `Google login failed: ${apiError.message || "Unknown error"}`
          );
        }
      } else {
        console.error("No credential in Google response:", response);
        toast.error("Google login failed: No credential received");
      }
    } catch (error: any) {
      console.error("Google login error details:", {
        message: error.message,
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      toast.error(`Google login failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await login(values);

      if (response.success && response.token && response.data) {
        toast.success("Login successful");
        storeLogin(response.data, response.token);

        // Redirect based on whether user has an organization
        if (!response.data.has_organization || response.data.org_count === 0) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign-In Button Container */}
      <div id="google-login-button" className="flex justify-center py-2"></div>
    </div>
  );
}
