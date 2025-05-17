import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/api/store/auth.store";
import { useOrganizationStore } from "@/api/store/organization.store";
import { Loader2 } from "lucide-react";
import { updateOnboardingStatus } from "@/api/services/auth.service";

interface ReviewProps {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

// Storage keys for organization data
const ORG_INFO_KEY = "onboarding_org_info";
const ORG_LOGO_KEY = "onboarding_org_logo";

type OrgInfo = {
  name: string;
  industry?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  signatory_name?: string;
};

export function Review({ nextStep, prevStep, goToStep }: ReviewProps) {
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateUserData } = useAuthStore();

  // Load data from sessionStorage on component mount
  useEffect(() => {
    const savedOrgInfo = sessionStorage.getItem(ORG_INFO_KEY);
    const savedLogo = sessionStorage.getItem(ORG_LOGO_KEY);

    if (savedOrgInfo) {
      setOrgInfo(JSON.parse(savedOrgInfo));
    }

    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  // Function to handle organization creation
  const handleCreateOrganization = async () => {
    if (!orgInfo?.name) {
      toast.error("Missing organization name", {
        description: "Please provide a name for your organization.",
      });
      return;
    }

    if (!user?._id) {
      toast.error("Authentication error", {
        description: "User session is invalid. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Add basic organization info
      formData.append("name", orgInfo.name);
      if (orgInfo.industry) formData.append("industry", orgInfo.industry);
      if (orgInfo.description)
        formData.append("description", orgInfo.description);
      if (orgInfo.phone) formData.append("phone", orgInfo.phone);
      if (orgInfo.email) formData.append("email", orgInfo.email);
      if (orgInfo.website) formData.append("website", orgInfo.website);
      if (orgInfo.signatory_name)
        formData.append("signatory_name", orgInfo.signatory_name);

      // Handle address - backend controller expects a JSON string
      if (orgInfo.address) {
        formData.append("address", JSON.stringify(orgInfo.address));
      }

      // Add logo if it exists
      if (logoUrl && logoUrl.startsWith("data:")) {
        try {
          const response = await fetch(logoUrl);
          const blob = await response.blob();
          formData.append("logo", blob, "logo.png");
        } catch (logoError) {
          console.error("Error processing logo:", logoError);
        }
      }

      // Get auth token
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Send request to API
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/organization`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", response.status, errorText);
        throw new Error(errorText || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      console.log("Organization created:", result);

      // Update onboarding status
      try {
        const onboardingResponse = await updateOnboardingStatus(user._id, true);
        if (onboardingResponse.success) {
          // Update user data in the store
          updateUserData({ ...user, hasOnboarded: true });
        }
      } catch (onboardingError) {
        console.error("Failed to update onboarding status:", onboardingError);
        // Continue with the flow even if this fails
      }

      toast.success("Organization created successfully!");
      nextStep();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedAddress = () => {
    if (!orgInfo?.address) return "No address provided";

    const { street, city, state, zipCode, country } = orgInfo.address;
    const parts = [street, city, state, zipCode, country].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h2 className="text-2xl font-bold mb-6">Review Information</h2>

      <p className="text-muted-foreground mb-8">
        Please review your organization information below. You can go back to
        make changes if needed.
      </p>

      <div className="space-y-8">
        {/* Organization Logo */}
        <div className="bg-muted/20 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Organization Logo</h3>
          <div className="flex items-center">
            {logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                  <Image
                    src={logoUrl}
                    alt="Organization Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => goToStep(2)}>
                  Change Logo
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-muted-foreground">
                  No Logo
                </div>
                <Button variant="outline" size="sm" onClick={() => goToStep(2)}>
                  Add Logo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-muted/20 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Organization Details</h3>
            <Button variant="outline" size="sm" onClick={() => goToStep(1)}>
              Edit Details
            </Button>
          </div>

          {orgInfo ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Name
                </h4>
                <p>{orgInfo.name}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Industry
                </h4>
                <p>{orgInfo.industry || "Not specified"}</p>
              </div>

              <div className="sm:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Description
                </h4>
                <p>{orgInfo.description || "No description provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Email
                </h4>
                <p>{orgInfo.email || "Not provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p>{orgInfo.phone || "Not provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Website
                </h4>
                <p>{orgInfo.website || "Not provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Signatory Name
                </h4>
                <p>{orgInfo.signatory_name || "Not provided"}</p>
              </div>

              <div className="sm:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Address
                </h4>
                <p>{getFormattedAddress()}</p>
              </div>
            </div>
          ) : (
            <p>
              No organization information found. Please go back and fill in the
              details.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button
          onClick={handleCreateOrganization}
          disabled={isSubmitting || !orgInfo?.name}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Organization"
          )}
        </Button>
      </div>
    </div>
  );
}
