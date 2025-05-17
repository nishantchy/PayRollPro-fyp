import { ApiError } from "../types";

/**
 * Default fetcher for SWR that handles error responses
 */
export const fetcher = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  // Get base URL from environment variable
  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  // Allow full URLs as well as relative paths
  const url = input.toString().startsWith("http")
    ? input.toString()
    : `${baseUrl}${input}`;

  console.log(`Fetching: ${url}`, init);

  try {
    const response = await fetch(url, init);

    // Log full response details for debugging - fix Header iteration issue
    console.log(`Fetch response for ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      // Use a different approach to log headers
      headers: Array.from(response.headers.entries()).reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, string>
      ),
    });

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`API error for ${url}:`, error);
      const apiError: ApiError = {
        status: response.status,
        message: error.message || "An error occurred while fetching the data.",
      };
      throw apiError;
    }

    const data = await response.json();
    console.log(`API data for ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

/**
 * Create an authenticated fetcher with the token from localStorage/cookies
 */
export const createAuthFetcher = (token?: string) => {
  return async <T>(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<T> => {
    // Get token from parameter, localStorage or cookie
    let authToken = token;

    if (!authToken && typeof window !== "undefined") {
      // Try to get token from localStorage
      authToken = localStorage.getItem("auth_token") || undefined;

      // If not in localStorage, try to get from cookies
      if (!authToken) {
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("auth_token=")
        );
        if (tokenCookie) {
          authToken = tokenCookie.split("=")[1];
        }
      }
    }

    // Log token info for debugging (masked for security)
    if (authToken) {
      console.log(`Using auth token: ${authToken.substring(0, 10)}...`);
    } else {
      console.warn("No auth token found for request");
    }

    // Create headers with authentication token
    const headers = new Headers(init?.headers);
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    // Merge init with new headers
    const authInit: RequestInit = {
      ...init,
      headers,
      credentials: "include", // Include cookies in the request
    };

    // Use the standard fetcher with the augmented init object
    return fetcher<T>(input, authInit);
  };
};
