import { fetcher, createAuthFetcher } from "./fetcher";
import type { ApiResponse } from "../types";

/**
 * API Client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl?: string, authToken?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000");

    // Try to load the token from storage if not provided
    if (!authToken && typeof window !== "undefined") {
      this.authToken = localStorage.getItem("auth_token") || undefined;
    } else {
      this.authToken = authToken;
    }

    // Log initialization
    console.log(`ApiClient initialized with baseUrl: ${this.baseUrl}`);
    console.log(`Auth token present: ${!!this.authToken}`);
  }

  /**
   * Set authentication token for requests
   */
  setAuthToken(token: string) {
    this.authToken = token;
    console.log("Setting auth token:", token.substring(0, 10) + "...");

    // Store in localStorage and cookies for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`;
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    console.log("Clearing auth token");
    this.authToken = undefined;
    // Clear from localStorage and cookies
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
    }
  }

  /**
   * Get the current authentication token
   */
  getAuthToken(): string | undefined {
    // If token is not in memory, try to get it from storage
    if (!this.authToken && typeof window !== "undefined") {
      this.authToken = localStorage.getItem("auth_token") || undefined;
    }
    return this.authToken;
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    console.log(
      `GET request to ${endpoint} with auth token: ${token ? "Present" : "Not present"}`
    );

    const fetchFunc = token ? createAuthFetcher(token) : fetcher;

    return fetchFunc<T>(this.createUrl(endpoint), {
      method: "GET",
      credentials: "include",
      ...options,
    });
  }

  /**
   * Make a POST request
   */
  async post<T, D = any>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    const fetchFunc = this.authToken
      ? createAuthFetcher(this.authToken)
      : fetcher;
    return fetchFunc<T>(this.createUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T, D = any>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    const fetchFunc = this.authToken
      ? createAuthFetcher(this.authToken)
      : fetcher;
    return fetchFunc<T>(this.createUrl(endpoint), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const fetchFunc = this.authToken
      ? createAuthFetcher(this.authToken)
      : fetcher;
    return fetchFunc<T>(this.createUrl(endpoint), {
      method: "DELETE",
      ...options,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T, D = any>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    const fetchFunc = this.authToken
      ? createAuthFetcher(this.authToken)
      : fetcher;
    return fetchFunc<T>(this.createUrl(endpoint), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Create a full URL from an endpoint
   */
  private createUrl(endpoint: string): string {
    // If the endpoint is already a full URL, return it as is
    if (endpoint.startsWith("http")) {
      return endpoint;
    }

    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }
}

/**
 * Create a singleton instance of ApiClient
 */
export const apiClient = new ApiClient();
