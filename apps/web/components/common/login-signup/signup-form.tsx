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
import { register, googleRegister } from "@/api/services/auth.service";
import { useAuthStore } from "@/api/store/auth.store";
import { ApiError } from "@/api/types";
import { decodeJwt } from "@/lib/jwt-helper";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().optional(),
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

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin } = useAuthStore();
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
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
        console.log("Using Google Client ID for signup:", clientId);

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const googleButtonContainer = document.getElementById(
          "google-signup-button"
        );
        if (googleButtonContainer) {
          window.google.accounts.id.renderButton(googleButtonContainer, {
            theme: "outline",
            size: "large",
            width: 240,
            text: "signup_with",
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
          const apiResponse = await googleRegister(response.credential);

          if (apiResponse.success && apiResponse.token && apiResponse.data) {
            toast.success("Google registration successful");
            storeLogin(apiResponse.data, apiResponse.token);

            // New users should always be directed to onboarding
            router.push("/onboarding");
          } else {
            console.error("API Response Error:", apiResponse);
            toast.error("Registration failed: Invalid API response");
          }
        } catch (apiError: any) {
          console.error("API Error Details:", {
            message: apiError.message,
            status: apiError.status,
            stack: apiError.stack,
            fullError: JSON.stringify(apiError),
          });
          toast.error(
            `Google registration failed: ${apiError.message || "Unknown error"}`
          );
        }
      } else {
        console.error("No credential in Google response:", response);
        toast.error("Google registration failed: No credential received");
      }
    } catch (error: any) {
      console.error("Google signup error details:", {
        message: error.message,
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      toast.error(
        `Google registration failed: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await register(values);

      if (response.success && response.token && response.data) {
        toast.success("Registration successful");
        storeLogin(response.data, response.token);

        // New users should always be directed to onboarding
        router.push("/onboarding");
      } else {
        toast.error("Registration failed");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Registration failed");
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+977 9XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
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

      {/* Google Sign-Up Button Container */}
      <div id="google-signup-button" className="flex justify-center py-2"></div>
    </div>
  );
}
