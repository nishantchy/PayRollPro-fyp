import { create } from "zustand";
import { Organization, OrganizationState } from "../types";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../services/organization.service";

interface OrganizationActions {
  setOrganizations: (organizations: Organization[]) => void;
  setCurrentOrganization: (organization: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchOrganizations: () => Promise<void>;
  fetchOrganizationById: (id: string) => Promise<void>;
  createNewOrganization: (data: FormData) => Promise<Organization | null>;
  updateExistingOrganization: (
    id: string,
    data: FormData
  ) => Promise<Organization | null>;
  removeOrganization: (id: string) => Promise<boolean>;
}

// Create the organization store
export const useOrganizationStore = create<
  OrganizationState & OrganizationActions
>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  loading: false,
  error: null,

  // Setters
  setOrganizations: (organizations) => set({ organizations }),
  setCurrentOrganization: (organization) =>
    set({ currentOrganization: organization }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchOrganizations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getOrganizations();
      set({ organizations: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch organizations",
        loading: false,
      });
    }
  },

  fetchOrganizationById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getOrganizationById(id);
      set({ currentOrganization: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch organization",
        loading: false,
      });
    }
  },

  createNewOrganization: async (data: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await createOrganization(data);
      const newOrganization = response.data;

      // Update the organizations list
      const organizations = [...get().organizations, newOrganization];
      set({
        organizations,
        currentOrganization: newOrganization,
        loading: false,
      });

      return newOrganization;
    } catch (error: any) {
      console.error("Store error creating organization:", error);

      // Set a more descriptive error message
      set({
        error: error.message || "Failed to create organization",
        loading: false,
      });
      return null;
    }
  },

  updateExistingOrganization: async (id: string, data: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await updateOrganization(id, data);
      const updatedOrganization = response.data;

      // Update the organizations list
      const organizations = get().organizations.map((org) =>
        org._id === updatedOrganization._id ? updatedOrganization : org
      );

      set({
        organizations,
        currentOrganization: updatedOrganization,
        loading: false,
      });

      return updatedOrganization;
    } catch (error: any) {
      set({
        error: error.message || "Failed to update organization",
        loading: false,
      });
      return null;
    }
  },

  removeOrganization: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteOrganization(id);

      // Update the organizations list
      const organizations = get().organizations.filter((org) => org._id !== id);

      // If the current organization is the one being deleted, clear it
      let currentOrganization = get().currentOrganization;
      if (currentOrganization && currentOrganization._id === id) {
        currentOrganization = null;
      }

      set({ organizations, currentOrganization, loading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete organization",
        loading: false,
      });
      return false;
    }
  },
}));
