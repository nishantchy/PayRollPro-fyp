export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CustomerData {
  _id: string;
  customer_id: string;
  name: string;
  email: string;
  photo?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  status: "active" | "inactive";
  authMethod?: "email" | "google";
  hasPassword?: boolean;
  has_organization: boolean;
  org_count: number;
  hasOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CustomerData | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Organization {
  _id: string;
  organization_id: string;
  name: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  customer_id: string;
  industry?: string;
  status: "active" | "inactive";
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  signature?: string;
  signatory_name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}
