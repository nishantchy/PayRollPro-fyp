import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/api/store/auth.store";
import { updateOnboardingStatus } from "@/api/services/auth.service";

export function Congratulations() {
  const router = useRouter();
  const { user, updateUserData } = useAuthStore();

  // Make sure onboarding status is set when this component mounts
  useEffect(() => {
    const ensureOnboardingStatus = async () => {
      // Only run if user exists and is not already marked as onboarded
      if (user?._id && !user.hasOnboarded) {
        try {
          const response = await updateOnboardingStatus(user._id, true);
          if (response.success) {
            // Update user data in the store
            updateUserData({ ...user, hasOnboarded: true });
            console.log("Onboarding status updated successfully");
          }
        } catch (error) {
          console.error("Failed to update onboarding status:", error);
          // We will still allow the user to proceed even if this fails
        }
      }
    };

    ensureOnboardingStatus();
  }, [user, updateUserData]);

  // Function to go to dashboard
  const goToDashboard = async () => {
    // Clear onboarding data from session storage
    sessionStorage.removeItem("onboarding_org_info");
    sessionStorage.removeItem("onboarding_org_logo");

    // One last attempt to ensure onboarding status is set before redirecting
    if (user?._id && !user.hasOnboarded) {
      try {
        await updateOnboardingStatus(user._id, true);
        updateUserData({ ...user, hasOnboarded: true });
      } catch (error) {
        console.error(
          "Final attempt to update onboarding status failed:",
          error
        );
      }
    }

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <div className="relative w-48 h-48">
          <Image
            src="/onboarding/success.svg"
            alt="Success"
            fill
            style={{ objectFit: "contain" }}
            // Fallback image if the SVG doesn't exist
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/300x300?text=Success";
            }}
          />
        </div>
      </div>

      {/* Success icon as fallback */}
      <div className="mb-6 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>

      <p className="text-lg text-muted-foreground mb-8">
        Your organization has been successfully created. You're now ready to
        start using PayrollPro!
      </p>

      <div className="bg-muted/20 p-6 rounded-lg mb-8 max-w-md w-full">
        <h3 className="font-medium mb-4">What's Next?</h3>
        <ul className="space-y-3 text-left">
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span>Add employees to your organization</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m22 22-2-2M2 22l2-2M7 8v.01M17 8v.01M12 8v.01M7 12v.01M17 12v.01M12 12v.01M7 16v.01M17 16v.01M12 16v.01"></path>
              </svg>
            </div>
            <span>Set up your payroll for your users</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
                <path d="M15 21v-6"></path>
                <path d="M15 12v-3"></path>
              </svg>
            </div>
            <span>Automate your payrolls</span>
          </li>
        </ul>
      </div>

      <Button onClick={goToDashboard} size="lg">
        Go to Dashboard
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </Button>
    </div>
  );
}
