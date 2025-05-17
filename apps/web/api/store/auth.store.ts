import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomerData, AuthState } from "../types";
import { apiClient } from "../lib/api-client";

interface AuthActions {
  setUser: (user: CustomerData | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: CustomerData, token: string) => void;
  logout: () => void;
  updateUserData: (user: CustomerData) => void;
}

// Create the auth store with persist middleware to keep state in localStorage
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: (user, token) => {
        // Set the token in the API client
        apiClient.setAuthToken(token);

        // Update the store
        set({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        });
      },

      logout: () => {
        // Clear the token from API client
        apiClient.clearAuthToken();

        // Reset the store
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      },

      updateUserData: (user) => {
        set((state) => ({
          ...state,
          user,
        }));
      },
    }),
    {
      name: "auth-storage", // name of the localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
