"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { getOrganizations } from "@/api/services/organization.service";
import { ApiError } from "@/api/types";
import { apiClient } from "@/api/lib/api-client";

// Define the Organization interface to match the backend model
interface Organization {
  _id: string;
  name: string;
  organization_id: string;
  logo?: string;
  industry?: string;
  status: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsNetworkError(false);
      console.log("Fetching organizations...");

      // Check authentication status
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        setError(
          "You need to be logged in to view organizations. Please log in again."
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        return;
      }

      console.log("Auth token exists:", !!token);
      console.log("Token begins with:", token.substring(0, 15) + "...");

      // Ensure API client has token
      apiClient.setAuthToken(token);

      // Make API call
      const response = await getOrganizations();
      console.log("API response:", response);

      if (response && response.data) {
        console.log("Organizations found:", response.data.data.length);
        setOrganizations(response.data.data);
      } else {
        console.error("Unexpected API response format:", response);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);

      // Determine if it's a network connectivity issue
      if (
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("network") ||
          err.message.includes("connect to server") ||
          err.message.includes("backend server is not reachable"))
      ) {
        setIsNetworkError(true);
        setError(
          "Network connection error. Please check your internet connection or ensure the server is running."
        );
      } else {
        const apiError = err as ApiError;

        // Handle specific error cases
        if (apiError.status === 401) {
          console.error(
            "Authentication error - clearing token and redirecting"
          );
          localStorage.removeItem("auth_token");
          apiClient.clearAuthToken();
          setError("Authentication failed. Please log in again.");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        } else if (apiError.status === 403) {
          setError("You don't have permission to view organizations.");
        } else {
          setError(
            `Failed to load organizations: ${apiError.message || "Unknown error"}`
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication retry
  const handleAuthRetry = () => {
    // Clear token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      apiClient.clearAuthToken();
    }
    router.push("/auth/login");
  };

  // Handle retry with counter to prevent infinite loops
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchOrganizations();
  };

  // Check connectivity to server
  const checkServerConnection = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      await fetch(`${baseUrl}/api/health`, {
        method: "HEAD",
        mode: "cors",
        cache: "no-cache",
      });
      // If we get here, server is reachable
      fetchOrganizations();
    } catch (error) {
      console.error("Server connection check failed:", error);
      setIsNetworkError(true);
      setError(
        "Cannot connect to server. Please check server status and your network connection."
      );
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAddOrganization = () => {
    router.push("/dashboard/organizations/new");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <span className="text-lg text-muted-foreground">
          Loading organizations...
        </span>
        {retryCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Attempt {retryCount + 1}...
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        {isNetworkError ? (
          <Wifi className="h-12 w-12 text-red-500 mb-2" />
        ) : (
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
        )}
        <h3 className="text-xl font-semibold mb-2">
          {isNetworkError ? "Connection Error" : "Error"}
        </h3>
        <p className="text-red-500 mb-6 max-w-md">{error}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          {isNetworkError ? (
            <>
              <Button onClick={handleRetry} className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={checkServerConnection}>
                Check Server Status
              </Button>
            </>
          ) : (
            <>
              <Button onClick={fetchOrganizations}>Try Again</Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
              <Button variant="destructive" onClick={handleAuthRetry}>
                Reset Authentication
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and their settings
          </p>
        </div>

        <Button onClick={handleAddOrganization}>
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Organization</span>
        </Button>
      </div>

      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card
              key={org._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/5 h-32 flex items-center justify-center">
                {org.logo ? (
                  <Image
                    src={org.logo}
                    alt={`${org.name} logo`}
                    width={100}
                    height={100}
                    className="object-contain max-h-24"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-primary/40" />
                )}
              </div>
              <CardContent className="pt-6">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold line-clamp-1">
                      {org.name}
                    </h2>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {org.status || "active"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {org.industry || "Not specified"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{org.organization_id}</p>
                    {org.address?.city && (
                      <p className="text-sm text-muted-foreground">
                        {org.address.city}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 pb-4 pt-4 flex justify-between">
                <Link
                  href={`/dashboard/organizations/${org._id}`}
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/organizations/${org._id}/manage`)
                  }
                >
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-muted/10 border border-dashed rounded-lg py-16">
          <Building2 className="h-16 w-16 text-muted mb-4" />
          <h3 className="text-xl font-medium mb-2">No organizations yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first organization to start managing your employees and
            payroll
          </p>
          <Button onClick={handleAddOrganization}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Organization</span>
          </Button>
        </div>
      )}
    </div>
  );
}
