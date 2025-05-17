import { apiClient } from "../lib/api-client";
import { ApiResponse, Organization } from "../types";

// Define more specific response type for organizations
interface OrganizationApiResponse {
  success: boolean;
  count: number;
  data: Organization[];
  message?: string;
}

/**
 * Create a new organization
 * @param organizationData Organization data
 */
export async function createOrganization(organizationData: FormData) {
  // Use fetch directly to avoid the automatic JSON serialization in apiClient
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/api/organization`;

  // Get authentication token
  let headers: HeadersInit = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: organizationData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Check if backend is reachable
 */
async function checkBackendConnection(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    console.log(`Checking backend connectivity at ${baseUrl}`);

    // Simple HEAD request to check if server is up
    const response = await fetch(`${baseUrl}/api/health`, {
      method: "HEAD",
      cache: "no-cache",
      mode: "cors",
    });

    return response.ok;
  } catch (error) {
    console.error("Backend server appears to be unavailable:", error);
    return false;
  }
}

/**
 * Get all organizations for the current customer
 */
export async function getOrganizations(): Promise<{
  data: OrganizationApiResponse;
}> {
  try {
    console.log("Calling getOrganizations API...");

    // First check if backend is reachable
    const isBackendReachable = await checkBackendConnection();
    if (!isBackendReachable) {
      throw new Error(
        "Backend server is not reachable. Please check your network connection and ensure the server is running."
      );
    }

    // Get authentication token directly for debugging
    let token = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_token");
      console.log("Auth token exists in getOrganizations:", !!token);

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      // Ensure the API client has the token
      apiClient.setAuthToken(token);
    }

    // Get the base URL for debugging
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    console.log(`Using API base URL: ${baseUrl}`);

    // Make API call with error handling
    console.log("Making API call to /api/organization");

    try {
      const response =
        await apiClient.get<OrganizationApiResponse>("/api/organization");
      console.log("getOrganizations API call successful", response);

      // Check if the response has the expected structure
      if (!response || !response.success) {
        console.error("Invalid API response format:", response);
        throw new Error("Received invalid response from server");
      }

      return { data: response };
    } catch (error) {
      // Check if it's a network error
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error("Network error when connecting to API:", error);
        throw new Error(
          "Could not connect to server. Please check your internet connection and try again."
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("getOrganizations API error:", error);
    // Re-throw with more context
    throw error;
  }
}

/**
 * Get organization by ID
 * @param id Organization ID
 */
export async function getOrganizationById(id: string) {
  return apiClient.get<ApiResponse<Organization>>(`/api/organization/${id}`);
}

/**
 * Update an organization
 * @param id Organization ID
 * @param organizationData Updated organization data
 */
export async function updateOrganization(
  id: string,
  organizationData: FormData
) {
  // Use fetch directly to avoid the automatic JSON serialization in apiClient
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/api/organization/${id}`;

  // Get authentication token
  let headers: HeadersInit = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: organizationData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Delete an organization
 * @param id Organization ID
 */
export async function deleteOrganization(id: string) {
  return apiClient.delete<ApiResponse<null>>(`/api/organization/${id}`);
}
