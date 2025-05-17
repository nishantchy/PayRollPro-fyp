import { apiClient } from "../lib/api-client";
import {
  ApiResponse,
  CustomerData,
  LoginCredentials,
  SignupCredentials,
} from "../types";

/**
 * Log in with email and password
 */
export async function login(credentials: LoginCredentials) {
  return apiClient.post<ApiResponse<CustomerData> & { token: string }>(
    "/api/customer/login",
    credentials
  );
}

/**
 * Register a new user
 */
export async function register(userData: SignupCredentials) {
  return apiClient.post<ApiResponse<CustomerData> & { token: string }>(
    "/api/customer/register",
    userData
  );
}

/**
 * Log in with Google
 * @param credential JWT token from Google Identity Services
 */
export async function googleLogin(credential: string) {
  return apiClient.post<ApiResponse<CustomerData> & { token: string }>(
    "/api/customer/google-login",
    { token: credential }
  );
}

/**
 * Register with Google
 * @param credential JWT token from Google Identity Services
 */
export async function googleRegister(credential: string) {
  return apiClient.post<ApiResponse<CustomerData> & { token: string }>(
    "/api/customer/google-register",
    { token: credential }
  );
}

/**
 * Log out the current user
 */
export function logout() {
  apiClient.clearAuthToken();
}

/**
 * Get current user's profile
 */
export async function getCurrentUser(id: string) {
  return apiClient.get<ApiResponse<CustomerData>>(`/api/customer/${id}`);
}

/**
 * Update customer's onboarding status
 * @param customerId The customer ID
 * @param hasOnboarded Boolean indicating whether the customer has completed onboarding
 */
export async function updateOnboardingStatus(
  customerId: string,
  hasOnboarded: boolean
) {
  return apiClient.patch<
    ApiResponse<{
      _id: string;
      customer_id: string;
      hasOnboarded: boolean;
    }>
  >(`/api/customer/${customerId}/onboarding`, { hasOnboarded });
}
